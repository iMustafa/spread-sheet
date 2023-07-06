// A0 => [0, 0]
export const _parseRefrenceToRowAndColumn = (refrence: string): [number, number] => {
  const letter = refrence.match(/[A-Za-z]+/)?.[0] || ''
  const numeric = refrence.match(/\d+/)?.[0] || ''
  const parsedNumber = letter.length === 1 ? letter.toUpperCase().charCodeAt(0) - 65 : 26
  return [parsedNumber, parseInt(numeric, 10)]
}

// 0-0 => A0
// [0, 2] => C0
export function _parseRowAndColumnToReference(id: string): string
export function _parseRowAndColumnToReference([row, column]: [number, number]): string
export function _parseRowAndColumnToReference(payload: [number, number] | string): string {
  const [row, column] =
    typeof payload === 'string'
      ? payload.split('-').map(i => parseInt(i))
      : payload;
  const letter =
    column >= 26
      ? String.fromCharCode(Math.floor(column / 26) + 64) + String.fromCharCode((column % 26) + 65)
      : String.fromCharCode(column + 65)
  return `${letter}${row}`
}
