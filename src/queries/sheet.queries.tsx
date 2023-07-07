import React from 'react'
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from 'react-query'
import { SheetsProvider } from '@/providers/sheet.provider'

export const useGetSheetStatus = (id: string, options: UseQueryOptions<any, any, any, any>) => {
  return useQuery(
    ['sheetStatus'],
    () => SheetsProvider.getStatus(id),
    options
  )
}

export const useUpdateSheet = (options: UseMutationOptions<any, any, any, any>) => {
  return useMutation(
    (sheet: string) => SheetsProvider.updateSheet(sheet),
    options
  )
}
