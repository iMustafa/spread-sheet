import React from "react"

export interface Props {
  children: React.ReactNode
}

export type SpreadSheetFieldState = {
  id: string
  value: string
  display: number
  touched?: boolean
  error?: boolean
}

export type SpreadSheetType = Record<string, SpreadSheetFieldState[]>

export interface SpreadSheetStateValue {
  sheet: SpreadSheetType
  canAddMore: boolean
  handleUpdateDependants: (id: string) => void
  handleUpdateField: (column: string, row: number, value: string) => void
  handleAddMoreRows: (n: number) => void
}
