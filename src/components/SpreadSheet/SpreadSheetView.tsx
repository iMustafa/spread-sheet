import React, { useMemo, useRef } from 'react'
import { Input, Flex, Text, Box, Grid, LoadingSpinner, Button } from '@/design-system'
import { useSpreadSheetContext } from '@/context'
import { useIntersectionObserver, useWatchAndUpdateSheet } from '@/hooks'
import { SpreadSheetField } from './SpreadSheetField'

export const SpreadSheetView = () => {
  const ref = useRef<HTMLDivElement>(null)
  const {
    sheet,
    canAddMore,
    handleAddMoreRows,
  } = useSpreadSheetContext()

  const {
    isUpdating,
    handleGenerateCSVDownloadLink
  } = useWatchAndUpdateSheet()

  const downloadCSVUrl = useMemo(() => {
    const url = handleGenerateCSVDownloadLink()
    return url
  }, [sheet])

  useIntersectionObserver({
    targetRef: ref,
    handler: () => {
      handleAddMoreRows(10)
    },
    options: { rootMargin: '0px' }
  })

  return (
    <Box>
      {
        isUpdating && (
          <Flex alignItems='center' my={2}>
            <LoadingSpinner />
            <Text ml={2} variation='label-minor'>Saving your changes...</Text>
          </Flex>
        )
      }
      <Flex flex={1}>
        <Input type='text' placeholder='Type a search query to filter' />
      </Flex>

      <Box my={2}>
        <Button as='a' href={downloadCSVUrl}>
          Download CSV
        </Button>
      </Box>

      <Grid
        mt={30}
        width='100%'
        borderRadius={8}
        overflow='hidden'
        gridTemplateColumns='repeat(3, minmax(100px, 1fr))'
      >
        {
          sheet?.map((_row, rowIndex) => (
            sheet[rowIndex].map((field) => (
              <SpreadSheetField key={field.id} field={field} />
            ))
          ))
        }
      </Grid>

      <Flex justifyContent='center' ref={ref}>
        {
          !canAddMore && (
            <Text variation='title'>
              Will add more rows when you change a field in the bottom 20% of the sheet and scroll down
            </Text>
          )
        }
      </Flex>
    </Box>
  )
}
