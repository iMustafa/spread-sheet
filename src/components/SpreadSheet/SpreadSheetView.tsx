import React, { useRef } from 'react'
import { Input, Flex, Text, Box } from '@/design-system'
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

      <Flex
        mt={30}
        width='100%'
        borderRadius={8}
        overflow='hidden'
      >
        {
          Object.keys(sheet).map(column => (
            <Flex flex={1} flexDirection='column' key={column}>
              {
                Object.keys(sheet[column]).map((row) => (
                  <SpreadSheetField
                    row={parseInt(row)}
                    column={column}
                    key={sheet[column][parseInt(row)].id}
                    field={sheet[column][parseInt(row)]}
                  />
                ))
              }
            </Flex>
          ))
        }

      </Flex>

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
