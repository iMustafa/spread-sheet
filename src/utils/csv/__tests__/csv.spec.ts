import { generateCSVString } from './../index'

describe('generateCSVString', () => {
  it('Should generate a CSV string with headers and data', () => {
    const input = {
      headers: ['x', 'y', 'z'],
      sheet: [
        [
          { id: '0-0', value: '10', display: '10', row: 0, column: 0 },
          { id: '0-1', value: '20', display: '20', row: 0, column: 1 },
          { id: '0-2', value: '30', display: '30', row: 0, column: 2 }
        ],
        [
          { id: '1-0', value: '40', display: '40', row: 1, column: 0 },
          { id: '1-1', value: '50', display: '50', row: 1, column: 1 },
          { id: '1-2', value: '60', display: '60', row: 1, column: 2 }
        ]
      ],
      lastEditField: { row: 1, column: 2, maxRow: 1 }
    }

    const expectedOutput =
      'x,y,z\n' +
      '10,20,30\n' +
      '40,50,60'

    expect(generateCSVString(input)).toBe(expectedOutput)
  })

  it('Should handle empty cells and values with commas', () => {
    const input = {
      headers: ['x', 'y', 'z'],
      sheet: [
        [
          { id: '0-0', value: '10', display: '10', row: 0, column: 0 },
          { id: '0-1', value: '20', display: '20', row: 0, column: 1 },
          { id: '0-2', value: '', display: '', row: 0, column: 2 }
        ],
        [
          { id: '1-0', value: '10,10', display: '10,10', row: 1, column: 0 },
          { id: '1-1', value: '', display: '', row: 1, column: 1 },
          { id: '1-2', value: '60', display: '60', row: 1, column: 2 }
        ]
      ],
      lastEditField: { row: 1, column: 2, maxRow: 1 }
    }

    const expectedOutput =
      'x,y,z\n' +
      '10,20,\n' +
      '"10,10",,60'

    expect(generateCSVString(input)).toBe(expectedOutput)
  })

  it('Should handle empty input', () => {
    const input = {
      headers: [],
      sheet: [],
      lastEditField: { row: 0, column: 0, maxRow: -1 }
    }

    const expectedOutput = ''

    expect(generateCSVString(input)).toBe(expectedOutput)
  })
})
