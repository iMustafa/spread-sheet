import React, { useContext, createContext, useState, useEffect } from "react"
import { useSetState } from "react-use"
import { Props, SpreadSheetStateValue, SpreadSheetType } from './types'
import { useEvaluateMathExpression } from '@/hooks'

export const SpreadSheetContext = createContext({} as SpreadSheetStateValue)

const ADDING_MORE_ROWS_THRESHOLD_DIVISOR = 25

export const SpreadSheetStateProvider = ({ children }: Props) => {
  const { evaluateExpression } = useEvaluateMathExpression()
  const [canAddMore, setCanAddMore] = useState(true)
  const [dependancysMap, setDependancysMap] = useSetState<Record<string, Set<string>>>({})

  const [sheet, setSheet] = useSetState<SpreadSheetType>({
    A: [],
    B: [],
    C: [],
  })

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
        if (dependencies) handleUpdateDepenciesMap(id, dependencies)
        display = result
      }
      else
        display = +value ? parseInt(value) : value

      setSheet(prev => ({
        [column]: {
          ...prev[column],
          [row]: { id, value, display, touched: true, error: false }
        }
      }))

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

    const newRows = Array.from({ length: n }, (_, i) => i)
    let index = Object.keys(sheet['A']).length

    setSheet(prev => {
      const newSheet = { ...prev }
      Object.keys(newSheet).forEach(column => {
        const newColumn = newSheet[column]
        const lastRow = Object.keys(newColumn).length
        newRows.forEach(row => {
          index = lastRow + row
          const id = `${column}${index}`
          newColumn[lastRow + row] = { id, value: `${index}`, display: index }
        })
      })

      if (index % ADDING_MORE_ROWS_THRESHOLD_DIVISOR === 0)
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
