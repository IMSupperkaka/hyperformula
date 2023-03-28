import {ErrorType, HyperFormula} from './../src'
import {ErrorMessage} from './../src/error-message'
import {
  adr,
  detailedError,
} from './testUtils'
describe('time', () => {
  it('时间', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=VALUE("10:23")'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual(0.432638889)
  })
  it('数字', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=123'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual(123)
  })
  it('单元格', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=A1'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual('1')
  })
  it('加减乘除', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=12312+123'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual(12435)
  })
  it('数字+文本', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=1231webn'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual('=1231webn')
  })
  it('数字+百分比', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=1231%'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual(12.31)
  })
  it('数字+‘+’+百分比', () => {
    const engine = HyperFormula.buildFromArray([
      ['1', 'a', 'b', 'c'],
      ['2', 'd', 'e', 'f'],
      ['3', 'g', 'h', 'i'],
      ['4', 'j', 'k', 'l'],
      ['5', 'm', 'n,  o'],
      ['=1231+%'],
    ])
    
    expect(engine.getCellValue(adr('A6'))).toEqual('=1231+%')
  })
})

// describe('value', () => {
//   it('日期', () => {
//     const engine = HyperFormula.buildFromArray([
//       ['1', 'a'],
//       ['2', '结果'],
//       ['3', 'c'],
//       ['4', 'd'],
//       ['5', 'e'],
//       ['=VALUE("1969-7-20")'],
//     ])

//     expect(engine.getCellValue(adr('A6'))).toEqual(25404)
//   })

//   it('时间', () => {
//     const engine = HyperFormula.buildFromArray([
//       ['1', 'a', 'b', 'c'],
//       ['2', 'd', 'e', 'f'],
//       ['3', 'g', 'h', 'i'],
//       ['4', 'j', 'k', 'l'],
//       ['5', 'm', 'n,  o'],
//       ['=VALUE("10:23")'],
//     ])
    
//     expect(engine.getCellValue(adr('A6'))).toEqual(0.432638889)
//   })


//   it('时间', () => {
//     const engine = HyperFormula.buildFromArray([
//       ['1', 'a', 'b', 'c'],
//       ['2', 'd', 'e', 'f'],
//       ['3', 'g', 'h', 'i'],
//       ['4', 'j', 'k', 'l'],
//       ['5', 'm', 'n,  o'],
//       ['=VALUE("1969-7-20 10:23")'],
//       ['=VALUE("10:23")'],
//     ])

//     expect(engine.getCellValue(adr('A6'))).toEqual(25404.43264)
//   })

//   it('整数字符串', () => {
//     const engine = HyperFormula.buildFromArray([
//       ['1', 'a', 'b', 'c'],
//       ['2', 'd', 'e', 'f'],
//       ['3', 'g', 'h', 'i'],
//       ['4', 'j', 'k', 'l'],
//       ['5', 'm', 'n,  o'],
//       ['=VALUE("123")'],
//     ])

//     expect(engine.getCellValue(adr('A6'))).toEqual(123)
//   })
//   it('小数字符串', () => {
//     const engine = HyperFormula.buildFromArray([
//       ['1', 'a'],
//       ['2', '结果'],
//       ['3', 'c'],
//       ['4', 'd'],
//       ['5', 'e'],
//       ['=VALUE("12312.123123123")'],
//     ])

//     expect(engine.getCellValue(adr('A6'))).toEqual(12312.123123123)
//   })
//   it('负数符串', () => {
//     const engine = HyperFormula.buildFromArray([
//       ['1', 'a'],
//       ['2', '结果'],
//       ['3', 'c'],
//       ['4', 'd'],
//       ['5', 'e'],
//       ['=VALUE("-123123.123123")'],
//     ])

//     expect(engine.getCellValue(adr('A6'))).toEqual(-123123.123123)
//   })


// })