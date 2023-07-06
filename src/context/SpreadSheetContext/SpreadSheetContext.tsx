import React, { useContext, createContext, useState } from "react"
import { useSetState } from "react-use"
import { useEvaluateMathExpression, useWatchAndUpdateSheet } from '@/hooks'
import { SpreadSheetFieldState, SpreadSheetType } from '@/types/sheet.types'

interface SpreadSheetStateValue {
  sheet: SpreadSheetType
  canAddMore: boolean
  handleUpdateDependants: (id: string) => void
  handleUpdateField: (column: string, row: number, value: string) => void
  handleAddMoreRows: (n: number) => void
}

interface Props {
  children: React.ReactNode
}

const ADDING_MORE_ROWS_THRESHOLD_DIVISOR = 25
const GENERATE_DUMMY_FIELD = (n: number, column: string, beginIndex = 0): SpreadSheetFieldState[] => {
  return Array.from({ length: n }, (_, i) => ({
    id: `${column}${i + beginIndex}`,
    value: '',
    display: '',
    touched: false,
    error: false
  }))
}

export const SpreadSheetContext = createContext({} as SpreadSheetStateValue)

export const SpreadSheetStateProvider = ({ children }: Props) => {
  const { evaluateExpression } = useEvaluateMathExpression()
  const [canAddMore, setCanAddMore] = useState(false)
  const [lastEditField, setLastEditedField] = useState({ column: '', row: 0 })
  const [dependancysMap, setDependancysMap] = useSetState<Record<string, Set<string>>>({})
  const [sheet, setSheet] = useSetState<SpreadSheetType>({
    A: GENERATE_DUMMY_FIELD(25, 'A'),
    B: GENERATE_DUMMY_FIELD(25, 'B'),
    C: GENERATE_DUMMY_FIELD(25, 'C'),
  })

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
      const column = dependant[0]
      const row = parseInt(dependant.slice(1))
      const { value } = sheet[column][row]
      handleUpdateField(column, row, value)
    })
  }

  const handleUpdateField = (column: string, row: number, value: string) => {
    const id = `${column}${row}`

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
        const updatedColumn = prev[column]
        updatedColumn[row] = { id, value, display, touched: true, error: false }
        return { [column]: updatedColumn }
      })

      setLastEditedField({ column, row })

      if (row / ADDING_MORE_ROWS_THRESHOLD_DIVISOR > 0.7)
        setCanAddMore(true)

    } catch (error: any) {
      setSheet(prev => ({
        [column]: {
          ...prev[column],
          [row]: { id, value, display: error.message, touched: true, error: true }
        }
      }))
    }
  }

  const handleAddMoreRows = (n: number) => {
    if (!canAddMore) return
    const lastRowIndex = Object.keys(sheet['A']).length

    setSheet(prev => {
      const newSheet = { ...prev }

      Object.keys(newSheet).forEach(column => {
        const updatedColumn = newSheet[column]
        const newRows = GENERATE_DUMMY_FIELD(n, column, lastRowIndex)
        newSheet[column] = [...updatedColumn, ...newRows]
      })

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
