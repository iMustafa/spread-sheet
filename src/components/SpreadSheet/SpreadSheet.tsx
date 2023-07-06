import React from 'react'
import { SpreadSheetStateProvider } from '@/context/SpreadSheetContext/SpreadSheetContext'
import { SpreadSheetView } from './SpreadSheetView'

export const SpreadSheet = () => {
  return (
    <SpreadSheetStateProvider>
      <SpreadSheetView />
    </SpreadSheetStateProvider>
  )
}
