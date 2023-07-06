import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from 'react-query'
import { SheetsProvider } from '@/providers/sheet.provider'
import {
  SheetStatus,
  SpreadSheetType,
  SheetUpdateStatus,
  SpreadSheetFieldState
} from '@/types'

export const useWatchAndUpdateSheet = (
  sheet: SpreadSheetType,
  lastEditField: { column: number, row: number, maxRow: number }
) => {
  const [canSaveAgain, setCanSaveAgain] = useState(false)
  const [activeSaveId, setActiveSaveId] = useState<string>("")
  const [savableSheet, setSavableSheet] = useState<string[]>(sheet.map((row) => row.map((field) => field.display)).flat())

  const headers = useMemo<string[]>(() => {
    const alphabets: string[] = []
    for (let i = 0; i < sheet[0].length; i++)
      alphabets.push(String.fromCharCode(65 + i))
    return alphabets
  }, [sheet[0].length])

  const generateCSVString = () => {
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

  const prepareSheetForUpdateAndDownload = () => {
    const csv = generateCSVString()
  }

  useEffect(() => {
    setSavableSheet(prev => {
      const { column, row } = lastEditField
      const index = (row * headers.length) + column
      const newValues = [...prev]
      newValues[index] = sheet[row][column].display
      return newValues
    })
  }, [lastEditField])

  useEffect(() => {
    const csv = generateCSVString()
    console.log(csv)
  }, [savableSheet])

  return {

  }
}
