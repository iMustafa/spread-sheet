import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useUpdateSheet, useGetSheetStatus } from '@/queries'
import { generateCSVString, getTimeDifferenceInMilliseconds } from '@/utils'
import { SheetStatus, SpreadSheetType, SheetUpdateStatusTimeout } from '@/types'

export const useWatchAndUpdateSheet = (
  sheet: SpreadSheetType,
  lastEditField: { column: number, row: number, maxRow: number },
  initialzed: boolean
) => {
  const timemout = useRef<NodeJS.Timeout | null>()

  const [canSaveAgain, setCanSaveAgain] = useState(true)
  const [wasUpdatedWhileSaving, setWasUpdatedWhileSaving] = useState(false)
  const [activeSheetProcess, setActiveSheetProcess] = useState<SheetUpdateStatusTimeout>({} as SheetUpdateStatusTimeout)

  const headers = useMemo<string[]>(() => {
    const alphabets: string[] = []
    for (let i = 0; i < sheet[0].length; i++)
      alphabets.push(String.fromCharCode(65 + i))
    return alphabets
  }, [sheet[0].length])

  const updateSheet = useUpdateSheet({
    retry: true,
    retryDelay: 0,
    onMutate: () => { setCanSaveAgain(false) },
    onSuccess: (data) => {
      const { status, done_at } = data
      if (status === SheetStatus.DONE) {
        setCanSaveAgain(true)
      } else if (status === SheetStatus.IN_PROGRESS) {
        const timeout = getTimeDifferenceInMilliseconds(done_at)
        setActiveSheetProcess({ ...data, timeout })
      }
    }
  })

  const getSheetStatus = useGetSheetStatus(activeSheetProcess.id ?? '', {
    enabled: false,
    cacheTime: 0,
    refetchInterval: 0,
    retryDelay: 1000,
    onSuccess: (data) => {
      timemout.current = null
      if (data.status === SheetStatus.DONE) {
        setCanSaveAgain(true)
        setActiveSheetProcess({} as SheetUpdateStatusTimeout)
        if (wasUpdatedWhileSaving) {
          setWasUpdatedWhileSaving(false)
          handleUpdateSheet()
        }
      } else if (data.status === SheetStatus.IN_PROGRESS) {
        longPollServerForUpdate()
      }
    }
  })

  const handleUpdateSheet = () => {
    const csv = generateCSVString({ headers, sheet, lastEditField })
    updateSheet.mutate(csv)
  }

  const longPollServerForUpdate = () => {
    if (!activeSheetProcess.id) return
    timemout.current = setTimeout(() => {
      getSheetStatus.refetch()
    }, 1000)
  }

  const handleGenerateCSVDownloadLink = () => {
    const csv = generateCSVString({ headers, sheet, lastEditField })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    return url
  }

  useEffect(() => {
    if (!initialzed) return
    if (updateSheet.isLoading || !canSaveAgain) {
      setWasUpdatedWhileSaving(true)
      return
    }
    handleUpdateSheet()
  }, [sheet, lastEditField])

  useEffect(() => {
    if (!activeSheetProcess.id || !activeSheetProcess.done_at) return
    timemout.current = setTimeout(() => {
      getSheetStatus.refetch()
    }, activeSheetProcess.timeout)
  }, [activeSheetProcess.id])

  return {
    isUpdating: updateSheet.isLoading || !canSaveAgain || wasUpdatedWhileSaving,
    handleGenerateCSVDownloadLink
  }
}
