import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Box, Text } from '@/design-system'
import { SpreadSheet } from '@/components'

const queryClient = new QueryClient()

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Box width='80%' margin="0 auto">
        <Box as='main' mt={50}>
          <Text variation='title' mb='4px'>
            Your Personal Staking Calculator
          </Text>

          <SpreadSheet />

        </Box>
      </Box>
    </QueryClientProvider>
  )
}
