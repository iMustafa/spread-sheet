import React from 'react'
import styled, { keyframes } from 'styled-components'
import { space, SpaceProps } from 'styled-system'
import { palette } from '../Theme/palette'

interface LoaderProps extends SpaceProps {
  size?: string
  borderRadius?: string
  color?: keyof typeof palette
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const SpinnerWrapper = styled.div<LoaderProps>`
  display: inline-block;
  width: ${({ size }) => size || '15px'};
  height: ${({ size }) => size || '15px'};
  border: 2px solid ${({ color }) => palette[color || "blue-100"]};
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${spin} 1s linear infinite;
  ${space}
`

export const LoadingSpinner: React.FC<LoaderProps> = (props) => {
  return <SpinnerWrapper {...props} />
}
