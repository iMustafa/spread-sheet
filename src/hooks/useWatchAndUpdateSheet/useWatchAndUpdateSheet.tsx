import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSetState } from 'react-use'
import { useQuery, useMutation } from 'react-query'
import { SheetsProvider } from '@/providers/sheet.provider'
import {
  SheetStatus,
  SpreadSheetType,
  SheetUpdateStatus,
  SpreadSheetFieldState
} from '@/types'

interface SavableSheet {
  heads: string[]
  values: string[]
  blob: string
}

export const useWatchAndUpdateSheet = (
  sheet: SpreadSheetType,
  lastEditField: { column: string, row: number }
) => {
  const [canSaveAgain, setCanSaveAgain] = useState(false)
  const [activeSaveId, setActiveSaveId] = useState<string>("")
  const [savableSheet, setSavableSheet] = useSetState<SavableSheet>({
    heads: [],
    values: [],
    blob: ''
  })

  const translateLetterNameToNumber = useCallback((characters: string) => {
    let result = 0
    for (const character of characters) {
      const charCode = character.charCodeAt(0) - 65
      result = result * 26 + charCode
    }
    return result
  }, [])

  const prepareSheetForUpdateAndDownload = () => {
    const { column, row } = lastEditField
    if (!column && !row) return

    const newSavableSheet = { ...savableSheet }

    // Handle new columns (Feature to continue working on if had enough time)
    if (!savableSheet.heads.includes(column)) {
      newSavableSheet.heads.push(column)
      newSavableSheet.values.push(
        sheet[column].map((field) => field.display).join(',')
      )
    }
    const columnIndex = translateLetterNameToNumber(column)
    const columnsLength = Object.keys(column).length
    const rowsLength = sheet[column].length

    const updateIndex = (columnIndex) + (row) * columnsLength

    console.log('>> COLUMN NUMBER', columnIndex)
    console.log('>> ROW NUMBER', row)
    console.log('>> UPDATING INDEX', updateIndex)

    newSavableSheet.values[updateIndex] = sheet[column][row].display

    let newBlob = newSavableSheet.heads.join(',') + '\n'
    for (let i = 0; i < newSavableSheet.values.length; i++) {
      if (i % (newSavableSheet.heads.length + 1) === 0 && i !== 0)
        newBlob += '\n'

      if (newSavableSheet.values[i] === undefined) {
        newBlob += ','
        continue
      }

      newBlob += newSavableSheet.values[i] + ','
    }
    newSavableSheet.blob = newBlob
    setSavableSheet(newSavableSheet)
  }

  const { data } = useQuery(
    'getSheetStatus',
    () => SheetsProvider.getStatus(activeSaveId),
    {
      enabled: !!activeSaveId,
      onSuccess: (status: SheetStatus) => {
        console.log('>> [GET STATUS] RECEIVED STATUS', status)
      }
    }
  )

  const updateSheet = useMutation(
    (spreadSheet: string) => SheetsProvider.updateSheet(spreadSheet),
    {
      retry: true,
      retryDelay: 0,
      onSuccess: (status) => {
        console.log('>> [SAVE] RECEIVED STATUS', status)
      }
    }
  )

  useEffect(() => {
    const columns = Object.keys(sheet)
    const columnsLength = columns.length
    const rowsLength = sheet[columns[0]].length

    const initSavableSheet = { ...savableSheet }

    initSavableSheet.heads = columns

    for (let i = 0; i < columnsLength; i++) {
      initSavableSheet.values = [
        ...initSavableSheet.values,
        ...Array.from<string>({ length: rowsLength })
      ]
    }

    setSavableSheet(initSavableSheet)
  }, [])

  useEffect(() => {
    prepareSheetForUpdateAndDownload()
  }, [sheet])

  return {

  }
}
