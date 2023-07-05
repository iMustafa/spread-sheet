import React from 'react'
import { Box, Text } from '@/design-system'
import { SpreadSheet } from '@/components'

export default function Home() {
  return (
    <Box width='80%' margin="0 auto">
      <Box as='main' mt={50}>
        <Text variation='title' mb='4px'>
          Your Personal Staking Calculator
        </Text>

        <SpreadSheet />

      </Box>
    </Box>
  )
}
