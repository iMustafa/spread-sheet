import React, { useContext, createContext, useState, useEffect } from "react"
import { useSetState } from "react-use"
import { useEvaluateMathExpression, useWatchAndUpdateSheet } from '@/hooks'
import { SpreadSheetFieldState, SpreadSheetType } from '@/types/sheet.types'

interface SpreadSheetStateValue {
  sheet: SpreadSheetType
  canAddMore: boolean
  handleUpdateDependants: (id: string) => void
  handleUpdateField: (row: number, column: number, value: string) => void
  handleAddMoreRows: (n: number) => void
}

interface Props {
  children: React.ReactNode
}

const ADDING_MORE_ROWS_THRESHOLD_DIVISOR = 25
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
  const { evaluateExpression } = useEvaluateMathExpression()
  const [canAddMore, setCanAddMore] = useState(false)
  const [lastEditField, setLastEditedField] = useState({ column: 0, row: 0 })
  const [dependancysMap, setDependancysMap] = useSetState<Record<string, Set<string>>>({})
  const [sheet, setSheet] = useState<SpreadSheetType>(GENERATE_DUMMY_FIELDS(100, 3))

  useWatchAndUpdateSheet(sheet, lastEditField)

  const handleUpdateDepenciesMap = (id: string, dependencies?: string[]) => {
    if (!dependencies) return
    for (const dependency of dependencies) {
      const dependants = new Set(dependancysMap[dependency] ?? [])
      dependants.add(id)
      setDependancysMap(() => ({
        [dependency]: dependants
      }))
    }
  }

  // TODO: Invisible bug to solve if I have time
  // Remove the dependency from the dependants when they're no longer related
  const handleUpdateDependants = (id: string) => {
    if (!dependancysMap[id]) return
    dependancysMap[id].forEach(dependant => {
      const id = dependant[0]
      const [row, column] = id.split('-').map(i => parseInt(i))
      const { value } = sheet[row][column]
      handleUpdateField(row, column, value)
    })
  }

  const handleUpdateField = (row: number, column: number, value: string) => {
    const id = `${row}-${column}`

    try {
      let display: any

      if (value?.startsWith('=')) {
        const { result, dependencies } = evaluateExpression(id, value, sheet, dependancysMap[id] ?? new Set())
        if (dependencies)
          handleUpdateDepenciesMap(id, dependencies)

        display = result
      } else {
        display = +value ? parseInt(value) : value
      }

      setSheet(prev => {
        const updatedSheet = [...prev]
        updatedSheet[row][column] = { id, value, display, row, column, touched: true, error: false }
        return updatedSheet
      })

      setLastEditedField({ row, column })

      if (row / ADDING_MORE_ROWS_THRESHOLD_DIVISOR > 0.7)
        setCanAddMore(true)

    } catch (error: any) {
      setSheet(prev => {
        const updatedSheet = [...prev]
        updatedSheet[row][column] = { id, value, display: error.message, row, column, touched: true, error: true }
        return updatedSheet
      })
    }
  }

  const handleAddMoreRows = (n: number) => {
    if (!canAddMore) return
    const lastRowIndex = sheet.length - 1

    setSheet(prev => {
      const newSheet = { ...prev }

      for (let i = 0; i < n; i++) {
        const newRow = []
        for (let j = 0; j < newSheet[0].length; j++) {
          newRow.push({
            id: `${lastRowIndex + i + 1}-${j}`,
            row: lastRowIndex + i + 1,
            column: j,
            value: '',
            display: '',
          })
        }
        newSheet.push(newRow)
      }

      if (lastRowIndex % ADDING_MORE_ROWS_THRESHOLD_DIVISOR === 0)
        setCanAddMore(false)

      return newSheet
    })
  }

  const stateValue = {
    sheet,
    canAddMore,
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
