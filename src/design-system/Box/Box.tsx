import React, { FC, ComponentProps } from 'react'
import styled from 'styled-components'
import {
  layout, LayoutProps,
  position, PositionProps,
  space, SpaceProps,
  size, SizeProps,
  border, BorderProps,
  flex, FlexProps,
  grid, GridProps,
  FlexboxProps,
  flexDirection, FlexDirectionProps,
  FlexBasisProps, FlexGrowProps, FlexShrinkProps, FlexWrapProps,
  flexBasis, flexGrow, flexShrink, flexWrap, flexbox
} from 'styled-system'
import { bgColorPalette, borderPalette } from '../Theme'

export interface BoxType
  extends PositionProps, LayoutProps, SpaceProps, SizeProps, BorderProps, FlexProps, GridProps, FlexboxProps, FlexDirectionProps,
  FlexBasisProps, FlexGrowProps, FlexShrinkProps, FlexWrapProps {
  children: React.ReactNode
  bg?: keyof typeof bgColorPalette
  boxShadow?: keyof typeof borderPalette
}

export type BoxRootComponent = FC<Omit<ComponentProps<'div'>, keyof BoxType>>

export const Box = styled<BoxRootComponent>('div' as unknown as BoxRootComponent) <BoxType>`
  ${position}
  ${layout}
  ${space}
  ${size}
  ${border}
  ${flex}
  ${grid}
  ${flexDirection}
  ${flexBasis}
  ${flexGrow}
  ${flexShrink}
  ${flexWrap}
  ${flexbox}
  ${(props) => props.bg && { backgroundColor: bgColorPalette[props.bg] }}
  ${(props) => props.boxShadow && { boxShadow: borderPalette[props.boxShadow] }}
`

export const Flex = styled(Box)`
  display: flex
`

export const Grid = styled(Box)`
  display: grid
`
