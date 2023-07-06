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
  lastEditField: { column: number, row: number }
) => {
  const [canSaveAgain, setCanSaveAgain] = useState(false)
  const [activeSaveId, setActiveSaveId] = useState<string>("")
  const [savableSheet, setSavableSheet] = useSetState<SavableSheet>({
    heads: [],
    values: [],
    blob: ''
  })

  const prepareSheetForUpdateAndDownload = () => {
    // console.log(sheet)
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
  }, [sheet])

  return {

  }
}
