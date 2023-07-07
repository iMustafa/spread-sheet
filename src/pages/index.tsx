import React from 'react'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Box, Text } from '@/design-system'
// import { SpreadSheet } from '@/components'

const SpreadSheet = dynamic(
  () => import('@/components/SpreadSheet/SpreadSheet').then((mod) => mod.SpreadSheet),
  { ssr: false }
)

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
