import React, { FC, ComponentProps } from 'react'
import styled from 'styled-components'
import {
  layout, LayoutProps,
  position, PositionProps,
  space, SpaceProps,
  border, BorderProps,
  size, SizeProps,
} from 'styled-system'
import { bgColorPalette, borderPalette } from '../Theme'

export interface ButtonType
  extends PositionProps, LayoutProps, SpaceProps, SizeProps, BorderProps {
  children: React.ReactNode
  bg?: keyof typeof bgColorPalette
  boxShadow?: keyof typeof borderPalette
}

export type ButtonRootComponent = FC<Omit<ComponentProps<'button'>, keyof ButtonType>>

export const UnStyledButton = styled.button<ButtonType>`
  ${position}
  ${layout}
  ${space}
  ${size}
  ${border}
  cursor: pointer;
  background-color: transparent;
  border: none;
  outline: none;
`

export const Button = styled<ButtonRootComponent>('button' as unknown as ButtonRootComponent) <ButtonType>`
  ${position}
  ${layout}
  ${space}
  ${size}
  ${border}
  outline: none;
  cursor: pointer;
  background-color: transparent;
  ${(props) => props.bg && { backgroundColor: bgColorPalette[props.bg] }}
  ${(props) => props.boxShadow && { boxShadow: borderPalette[props.boxShadow] }}
`
