import React, { useContext, createContext, useState } from "react"
import { useSetState } from "react-use"
import { SpreadSheetFieldState, SpreadSheetType } from '@/types/sheet.types'
import { MathParser, parseReferenceToRowAndColumn, parseRowAndColumnToReference } from "@/utils"

interface SpreadSheetStateValue {
  sheet: SpreadSheetType
  canAddMore: boolean
  lastEditField: { column: number, row: number, maxRow: number }
  initialzed: boolean
  handleUpdateDependants: (id: string) => void
  handleUpdateField: (row: number, column: number, value: string) => void
  handleAddMoreRows: (n: number) => void
}

interface Props {
  children: React.ReactNode
}

const ADDING_MORE_ROWS_THRESHOLD_DIVISOR = 30
const GENERATE_DUMMY_FIELDS = (rows: number, columns: number): SpreadSheetFieldState[][] => {
  const fields: SpreadSheetFieldState[][] = []
  for (let i = 0; i < rows; i++) {
    fields.push([])
    for (let j = 0; j < columns; j++) {
      fields[i].push({
        id: `${i}-${j}`,
        row: i,
        column: j,
        value: '',
        display: '',
      })
    }
  }
  return fields
}

export const SpreadSheetContext = createContext({} as SpreadSheetStateValue)

export const SpreadSheetStateProvider = ({ children }: Props) => {
  const [initialzed, setInitialized] = useState(false)
  const [canAddMore, setCanAddMore] = useState(false)
  const [lastEditField, setLastEditedField] = useState({ column: 0, row: 0, maxRow: 0 })

  // { [reference: string]: Set<id: row-column> }
  const [dependancysMap, setDependancysMap] = useSetState<Record<string, Set<string>>>({})
  const [sheet, setSheet] = useState<SpreadSheetType>(GENERATE_DUMMY_FIELDS(ADDING_MORE_ROWS_THRESHOLD_DIVISOR, 3))

  const handleUpdateDepenciesMap = (reference: string, dependencies?: string[]) => {
    if (!dependencies) return
    for (const dependency of dependencies) {
      const dependants = new Set(dependancysMap[dependency] ?? [])
      dependants.add(reference)
      setDependancysMap(() => ({
        [dependency]: dependants
      }))
    }
  }

  // TODO: Invisible bug to solve if I have time [Slight Performance Toll]
  // Remove the dependency from the dependants when they're no longer related
  const handleUpdateDependants = (id: string) => {
    if (!dependancysMap[id]) return
    dependancysMap[id].forEach(dependantRef => {
      const [row, column] = parseReferenceToRowAndColumn(dependantRef)
      const { value } = sheet[row][column]
      handleUpdateField(row, column, value)
    })
  }

  const handleUpdateField = (row: number, column: number, value: string) => {
    const id = `${row}-${column}`
    const reference = parseRowAndColumnToReference(id)

    try {
      let display: string
      let hasFormula = value?.startsWith('=')

      if (hasFormula) {
        const { result } = MathParser.evaluateExpression(
          id,
          value,
          sheet,
          dependancysMap[reference] ?? new Set(),
          handleUpdateDepenciesMap
        )

        display = result.toString()
        hasFormula = true
      } else {
        display = +value ? parseFloat(value).toString() : value
        console.log('>> SETTING DISPLAY', display)
      }

      // Prevent save on initial load
      if (!initialzed)
        setInitialized(true)

      setSheet(prev => {
        const updatedSheet = [...prev]
        updatedSheet[row][column] = { id, value, display, row, column, hasFormula, touched: true, hasError: false }
        return updatedSheet
      })

      setLastEditedField((prev) => {
        return {
          row,
          column,
          maxRow: Math.max(prev.maxRow, row)
        }
      })

      if (row / ADDING_MORE_ROWS_THRESHOLD_DIVISOR > 0.8)
        setCanAddMore(true)

    } catch (error: any) {
      setSheet(prev => {
        const updatedSheet = [...prev]
        updatedSheet[row][column] = { id, value, display: error.message, row, column, touched: true, hasError: true }
        return updatedSheet
      })
    }
  }

  const handleAddMoreRows = (n: number) => {
    if (!canAddMore) return;
    const lastRowIndex = sheet.length - 1;

    setSheet(prev => {
      const newSheet = [...prev]
      const newRow = []

      for (let j = 0; j < newSheet[0].length; j++)
        newRow.push({
          id: `${lastRowIndex + 1}-${j}`,
          row: lastRowIndex + 1,
          column: j,
          value: '',
          display: '',
        })

      for (let i = 0; i < n; i++)
        newSheet.push([...newRow])

      return newSheet
    })

    if ((lastRowIndex + 1) % ADDING_MORE_ROWS_THRESHOLD_DIVISOR === 0)
      setCanAddMore(false)
  }

  const stateValue = {
    sheet,
    canAddMore,
    lastEditField,
    initialzed,
    handleUpdateField,
    handleUpdateDependants,
    handleAddMoreRows
  }

  return (
    <SpreadSheetContext.Provider value={stateValue}>
      {children}
    </SpreadSheetContext.Provider>
  )
}

export const useSpreadSheetContext = () => useContext(SpreadSheetContext)
