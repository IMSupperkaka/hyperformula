/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */

import {AbsoluteCellRange} from '../../AbsoluteCellRange'
import {CellError, ErrorType, simpleCellAddress} from '../../Cell'
import {ErrorMessage} from '../../error-message'
import {RowSearchStrategy} from '../../Lookup/RowSearchStrategy'
import {SearchOptions, SearchStrategy} from '../../Lookup/SearchStrategy'
import {ProcedureAst} from '../../parser'
import {StatType} from '../../statistics'
import {zeroIfEmpty} from '../ArithmeticHelper'
import {InterpreterState} from '../InterpreterState'
import {InternalScalarValue, InterpreterValue, RawNoErrorScalarValue} from '../InterpreterValue'
import {SimpleRangeValue} from '../SimpleRangeValue'
import {ArgumentTypes, FunctionPlugin, FunctionPluginTypecheck} from './FunctionPlugin'

export class LookupPlugin extends FunctionPlugin implements FunctionPluginTypecheck<LookupPlugin> {
  public static implementedFunctions = {
    'LOOKUP': {
      method: 'lookup',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR},
        {argumentType: ArgumentTypes.RANGE},
        {argumentType: ArgumentTypes.RANGE},
      ]
    },
    'VLOOKUP': {
      method: 'vlookup',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR},
        {argumentType: ArgumentTypes.RANGE},
        {argumentType: ArgumentTypes.NUMBER},
        {argumentType: ArgumentTypes.BOOLEAN, defaultValue: true},
      ]
    },
    'HLOOKUP': {
      method: 'hlookup',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR},
        {argumentType: ArgumentTypes.RANGE},
        {argumentType: ArgumentTypes.NUMBER},
        {argumentType: ArgumentTypes.BOOLEAN, defaultValue: true},
      ]
    },
    'MATCH': {
      method: 'match',
      parameters: [
        {argumentType: ArgumentTypes.NOERROR},
        {argumentType: ArgumentTypes.RANGE},
        {argumentType: ArgumentTypes.NUMBER, defaultValue: 1},
      ]
    },
  }
  private rowSearch: RowSearchStrategy = new RowSearchStrategy(this.dependencyGraph)
    /**
   * Corresponds to LOOKUP(key, rangeValue, range)
   *
   * @param ast
   * @param state
   *  searchRange的第一列【优先列， 单行是按行查找】 查找key 对应的index 再在resultRange【单行｜单列】中查找第index个对应的值 返回
   */
    public lookup(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
      return this.runFunction(ast.args, state, this.metadata('LOOKUP'), (key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, rangeResultValue: SimpleRangeValue) => {
        const range = rangeValue.range
        const resRange = rangeResultValue.range
        if (range === undefined) {
          return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
        }
        if (resRange === undefined || (resRange?.start.col !== resRange?.end.col && resRange?.start.row !== resRange?.end.row) ) {
          return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
        }
  
        return this.doLookup(zeroIfEmpty(key), rangeValue, rangeResultValue)
      })
    }
  /**
   * Corresponds to VLOOKUP(key, range, index, [sorted])
   *
   * @param ast
   * @param state
   */
  public vlookup(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('VLOOKUP'), (key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, index: number, sorted: boolean) => {
      const range = rangeValue.range

      if (range === undefined) {
        return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
      }
      if (index < 1) {
        return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne)
      }
      if (index > range.width()) {
        return new CellError(ErrorType.REF, ErrorMessage.IndexLarge)
      }

      return this.doVlookup(zeroIfEmpty(key), rangeValue, index - 1, sorted)
    })
  }

  /**
   * Corresponds to HLOOKUP(key, range, index, [sorted])
   *
   * @param ast
   * @param state
   */
  public hlookup(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('HLOOKUP'), (key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, index: number, sorted: boolean) => {
      const range = rangeValue.range
      if (range === undefined) {
        return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
      }
      if (index < 1) {
        return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne)
      }
      if (index > range.height()) {
        return new CellError(ErrorType.REF, ErrorMessage.IndexLarge)
      }

      return this.doHlookup(zeroIfEmpty(key), rangeValue, index - 1, sorted)
    })
  }

  public match(ast: ProcedureAst, state: InterpreterState): InterpreterValue {
    return this.runFunction(ast.args, state, this.metadata('MATCH'), (key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, type: number) => {
      return this.doMatch(zeroIfEmpty(key), rangeValue, type)
    })
  }

  protected searchInRange(key: RawNoErrorScalarValue, range: SimpleRangeValue, sorted: boolean, searchStrategy: SearchStrategy): number {
    // console.log('searchInRange --fn', range)
    if (!sorted && typeof key === 'string' && this.arithmeticHelper.requiresRegex(key)) {
      return searchStrategy.advancedFind(
        this.arithmeticHelper.eqMatcherFunction(key),
        range
      )
    } else {
      const searchOptions: SearchOptions = sorted ? { ordering: 'asc' } : { ordering: 'none', matchExactly: true }
      return searchStrategy.find(key, range, searchOptions)
    }
  }

  private doLookup(key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, rangeResultValue: SimpleRangeValue): InternalScalarValue {
  
    this.dependencyGraph.stats.start(StatType.LOOKUP)
    const range = rangeValue.range
    const resultRange = rangeResultValue.range
    let searchedRange
    let resultedRange
    const isColumnSearch = (range?.end?.row || 0) > (range?.start?.row || 0)
    if (range === undefined) {
      searchedRange = SimpleRangeValue.onlyValues(rangeValue.data.map((arg) => [arg[0]]))
    } else {
      if (isColumnSearch) {
        searchedRange = SimpleRangeValue.onlyRange(AbsoluteCellRange.spanFrom(range.start, 1, range.height()), this.dependencyGraph)
      } else {
        searchedRange = SimpleRangeValue.onlyRange(AbsoluteCellRange.spanFrom(range.start, range.width(), 1), this.dependencyGraph)
      }
    }
    if (resultRange === undefined) {
      resultedRange = SimpleRangeValue.onlyValues(rangeResultValue.data.map((arg) => [arg[0]]))
    } else {
      resultedRange = SimpleRangeValue.onlyRange(AbsoluteCellRange.spanFrom(resultRange.start, 1, resultRange.height()), this.dependencyGraph)
    }
    let index

    // row 先列后行 【当有多列的时候， 按第一列查找 】
    if (isColumnSearch) {
      index= this.searchInRange(key, searchedRange, false, this.columnSearch)
    } else {
      index = this.searchInRange(key, searchedRange, false, this.rowSearch)
    }
    if (index === -1) {
      return new CellError(ErrorType.NA, ErrorMessage.ValueNotFound)
    }
    console.log('range')

    console.log('index', index)

    let value
    if (resultRange === undefined) {
      value = rangeResultValue?.data?.[0]?.[index]
    } else {
      let address
      if((resultRange?.end?.row || 0) > (resultRange?.start?.row || 0)) {
         address = simpleCellAddress(resultRange.sheet, resultRange.start.col, resultRange.start.row + index)
      } else {
        address = simpleCellAddress(resultRange.sheet, resultRange.start.col + index, resultRange.start.row)
      }
      value = this.dependencyGraph.getCellValue(address)
    }
    console.log('value', value)

    if (value instanceof SimpleRangeValue) {
      return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
    }
    return value
  }
  private doVlookup(key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, index: number, sorted: boolean): InternalScalarValue {
    this.dependencyGraph.stats.start(StatType.VLOOKUP)
    const range = rangeValue.range
    let searchedRange
    if (range === undefined) {
      searchedRange = SimpleRangeValue.onlyValues(rangeValue.data.map((arg) => [arg[0]]))
    } else {
      searchedRange = SimpleRangeValue.onlyRange(AbsoluteCellRange.spanFrom(range.start, 1, range.height()), this.dependencyGraph)
    }
    const rowIndex = this.searchInRange(key, searchedRange, sorted, this.columnSearch)

    this.dependencyGraph.stats.end(StatType.VLOOKUP)

    if (rowIndex === -1) {
      return new CellError(ErrorType.NA, ErrorMessage.ValueNotFound)
    }

    let value
    if (range === undefined) {
      value = rangeValue.data[rowIndex][index]
    } else {
      const address = simpleCellAddress(range.sheet, range.start.col + index, range.start.row + rowIndex)
      value = this.dependencyGraph.getCellValue(address)
    }

    if (value instanceof SimpleRangeValue) {
      return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
    }
    return value
  }

  private doHlookup(key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, index: number, sorted: boolean): InternalScalarValue {
    const range = rangeValue.range
    let searchedRange
    if (range === undefined) {
      searchedRange = SimpleRangeValue.onlyValues([rangeValue.data[0]])
    } else {
      searchedRange = SimpleRangeValue.onlyRange(AbsoluteCellRange.spanFrom(range.start, range.width(), 1), this.dependencyGraph)
    }
    const colIndex = this.searchInRange(key, searchedRange, sorted, this.rowSearch)

    if (colIndex === -1) {
      return new CellError(ErrorType.NA, ErrorMessage.ValueNotFound)
    }

    let value
    if (range === undefined) {
      value = rangeValue.data[index][colIndex]
    } else {
      const address = simpleCellAddress(range.sheet, range.start.col + colIndex, range.start.row + index)
      value = this.dependencyGraph.getCellValue(address)
    }

    if (value instanceof SimpleRangeValue) {
      return new CellError(ErrorType.VALUE, ErrorMessage.WrongType)
    }
    return value
  }

  private doMatch(key: RawNoErrorScalarValue, rangeValue: SimpleRangeValue, type: number): InternalScalarValue {
    if (![-1, 0, 1].includes(type)) {
      return new CellError(ErrorType.VALUE, ErrorMessage.BadMode)
    }

    if (rangeValue.width() > 1 && rangeValue.height() > 1) {
      return new CellError(ErrorType.NA)
    }

    const searchStrategy = rangeValue.width() === 1 ? this.columnSearch : this.rowSearch
    const searchOptions: SearchOptions = type === 0
      ? { ordering: 'none', matchExactly: true }
      : { ordering: type === -1 ? 'desc' : 'asc' }
    const index = searchStrategy.find(key, rangeValue, searchOptions)

    if (index === -1) {
      return new CellError(ErrorType.NA, ErrorMessage.ValueNotFound)
    }
    return index + 1
  }
}
