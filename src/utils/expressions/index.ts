// A0 => [0, 0]
export const parseReferenceToRowAndColumn = (reference: string): [number, number] => {
  const letter = reference.match(/[A-Za-z]+/)?.[0] || ''
  const numeric = reference.match(/\d+/)?.[0] || ''
  const parsedNumber = letter.length === 1 ? letter.toUpperCase().charCodeAt(0) - 65 : 26
  return [parseInt(numeric, 10), parsedNumber]
}

// A0 => "0-0"
export function parseReferenceToId(reference: string): string {
  const [row, column] = parseReferenceToRowAndColumn(reference)
  return `${row}-${column}`
}

// 0-0 => A0
// [0, 2] => C0
export function parseRowAndColumnToReference(id: string): string
export function parseRowAndColumnToReference([row, column]: [number, number]): string
export function parseRowAndColumnToReference(payload: [number, number] | string): string {
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
