import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
  values: string[]
  blob: string
}

export const useWatchAndUpdateSheet = (
  sheet: SpreadSheetType,
  lastEditField: { column: number, row: number }
) => {
  const [canSaveAgain, setCanSaveAgain] = useState(false)
  const [activeSaveId, setActiveSaveId] = useState<string>("")

  const headers = useMemo<string[]>(() => {
    const alphabets: string[] = []
    for (let i = 0; i < sheet[0].length; i++) {
      alphabets.push(String.fromCharCode(65 + i))
    }
    return alphabets
  }, [sheet[0].length])

  const [savableSheet, setSavableSheet] = useSetState<SavableSheet>({
    values: [],
    blob: ''
  })

  const generateCSVString = () => {
    const rows = [headers.join(",")]
    const lastEditedRow = lastEditField.row

    for (let i = 0; i < lastEditedRow + 1; i++) {
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
    prepareSheetForUpdateAndDownload()
  }, [lastEditField])

  return {

  }
}
