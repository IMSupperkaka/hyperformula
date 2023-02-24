import {ErrorType, HyperFormula} from './../src'
import {ErrorMessage} from './../src/error-message'
import {
  adr,
  detailedError,
} from './testUtils'

describe('LOOKUP', () => {
  it('按列查找值位置，返回另一列对应位置的结果', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=LOOKUP("2", A1:B5, B1:B5)'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual('结果')
  })

  it('按行查找值位置，返回另一行对应位置的结果', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=LOOKUP("2", A2:D2, A5:B5)'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual('5')
  })

  it('按行查找值位置，返回另一列对应位置的结果', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=LOOKUP("d", A2:D2, A1:A5)', 'B6', 'C6', 'D6'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual('2')
  })

  it('按列查找值位置，返回另一行对应位置的结果', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=LOOKUP("4", A1:D5, A1:D1)', 'B6', 'C6', 'D6'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual('c')
  })

  it('按列查找值位置，返回另一行对应位置的结果, 超出范围', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=LOOKUP("5", A1:D5, A1:D1)', 'B6', 'C6', 'D6'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(null)
  })


})
describe('LOOKUP', () => {
  it('2参数：按列查找值位置，返回最后一列对应位置的结果', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=LOOKUP("2", A1:B5)'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual('结果')
  })
  it('2参数：按行查找值位置，返回最后一行对应位置的结果 ', () => {
    //返回的搜索的值： 【因为按行查找说明只有一行 一行的最后一行还是本行】
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'aa'],
      ['2', '结果', '结果几个'],
      ['3', 'c', 'cc'],
      ['4', 'd', 'dd'],
      ['5', 'e', 'ee'],
      ['=LOOKUP("结果", A2:C2)'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual('结果')
  })
})