import React, { useRef } from 'react'
import { Input, Flex, Text, Box, Grid } from '@/design-system'
import { useSpreadSheetContext } from '@/context'
import { useIntersectionObserver } from '@/hooks'
import { SpreadSheetField } from './SpreadSheetField'

export const SpreadSheetView = () => {
  const ref = useRef<HTMLDivElement>(null)
  const {
    sheet,
    canAddMore,
    handleAddMoreRows,
  } = useSpreadSheetContext()

  useIntersectionObserver({
    targetRef: ref,
    handler: () => {
      handleAddMoreRows(10)
    },
    options: { rootMargin: '0px' }
  })

  return (
    <Box>
      <Flex flex={1}>
        <Input type='text' placeholder='Type a search query to filter' />
      </Flex>

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
              Recently added fields were not touched.
            </Text>
          )
        }
      </Flex>
    </Box>
  )
}
