import {ErrorType, HyperFormula} from '../src'
import {ErrorMessage} from '../src/error-message'
import {
  adr,
  detailedError,
} from './testUtils'

describe('dateValue|Days', () => {
  it('dateValue 类型 yyyy-mm-dd', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=DATEVALUE("2022-7-20")'],
      // ['=VALUE("2023-12-10")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(44762)
    // expect(engine.getCellValue(adr('A7'))).toEqual(2001)
  })
  it('DAYS xx yyyy-mm-dd', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=DAYS("2022-7-20", "2021-9-10")'],
      // ['=VALUE("2023-12-10")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(313)
    // expect(engine.getCellValue(adr('A7'))).toEqual(2001)
  })



})
