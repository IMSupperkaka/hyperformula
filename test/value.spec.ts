import {ErrorType, HyperFormula} from './../src'
import {ErrorMessage} from './../src/error-message'
import {
  adr,
  detailedError,
} from './testUtils'

describe('value', () => {
  it('日期', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=VALUE("1969-7-20")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(25404)
  })


  it('时间', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=VALUE("1969-7-20 10:23")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(25404.43264)
  })

  it('整数字符串', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=VALUE("123")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(123)
  })
  it('小数字符串', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=VALUE("12312.123123123")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(12312.123123123)
  })
  it('负数符串', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a'],
      ['2', '结果'],
      ['3', 'c'],
      ['4', 'd'],
      ['5', 'e'],
      ['=VALUE("-123123.123123")'],
    ])

    expect(engine.getCellValue(adr('A6'))).toEqual(-123123.123123)
  })


})