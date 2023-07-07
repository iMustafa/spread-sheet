import { SpreadSheetType } from '@/types'

interface CSVInputParams {
  headers: string[],
  sheet: SpreadSheetType,
  lastEditField: { row: number, column: number, maxRow: number }
}

export const generateCSVString = ({ headers, sheet, lastEditField }: CSVInputParams) => {
  const rows = [headers.join(",")]
  const outMostEditedRow = lastEditField.maxRow
  for (let i = 0; i < outMostEditedRow + 1; i++) {
    const row = sheet[i]
    const formattedRow = row.map((row) => {
      const { display: displayedValue, hasError } = row
      if (hasError) return ""
      if (typeof displayedValue === "string" && displayedValue.includes(","))
        return `"${displayedValue}"`
      return displayedValue
    })
    rows.push(formattedRow.join(","))
  }
  return rows.join("\n")
}
