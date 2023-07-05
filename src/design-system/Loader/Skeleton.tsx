import React from 'react'
import styled, { keyframes } from 'styled-components'
import { space, SpaceProps } from 'styled-system'

interface SkeletonProps extends SpaceProps {
  width?: string
  height?: string
  borderRadius?: string
}

const shimmer = keyframes`
  0% {
    background-position: -200px 0
  }
  100% {
    background-position: 200px 0
  }
`

const SkeletonWrapper = styled.div<SkeletonProps>`
  display: inline-block;
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '15px'};
  background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
  background-size: 800px 104px;
  animation: ${shimmer} 1.5s linear infinite;
  border-radius: ${({ borderRadius }) => borderRadius || '8px'};
  ${space}
`

export const SkeletonLoadingBar: React.FC<SkeletonProps> = (props) => {
  return <SkeletonWrapper {...props} />
}
