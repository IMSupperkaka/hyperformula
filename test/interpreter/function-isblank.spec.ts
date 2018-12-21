import {HandsOnEngine} from '../../src'
import {cellError, ErrorType} from '../../src/Cell'

describe('Interpreter', () => {
  it('function ISBLANK should return true for references to empty cells', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['', '=ISBLANK(A1)', '=ISBLANK($A1)', '=ISBLANK(OFFSET(C1,0,-2))'],
    ])
    expect(engine.getCellValue('B1')).toEqual(true)
    expect(engine.getCellValue('C1')).toEqual(true)
    expect(engine.getCellValue('D1')).toEqual(true)
  })

  it('function ISBLANK should return false if it is not reference to empty cell', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['', '=A1', '=ISBLANK(B1)', '=ISBLANK("")', '=ISBLANK(4)', '=ISBLANK(CONCATENATE(A1,A1))'],
    ])
    expect(engine.getCellValue('C1')).toEqual(false)
    expect(engine.getCellValue('D1')).toEqual(false)
    expect(engine.getCellValue('E1')).toEqual(false)
    expect(engine.getCellValue('F1')).toEqual(false)
  })

  it('function ISBLANK takes exactly one argument', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['=ISBLANK(A3, A2)', '=ISBLANK()'],
    ])
    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.NA))
    expect(engine.getCellValue('B1')).toEqual(cellError(ErrorType.NA))
  })
})