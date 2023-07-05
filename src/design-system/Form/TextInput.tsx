import React, { FC, ComponentProps } from "react"
import styled from "styled-components"
import {
  layout, LayoutProps,
  position, PositionProps,
  space, SpaceProps,
  size, SizeProps,
  border, BorderProps,
  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  textAlign,
} from 'styled-system'
import { bgColorPalette, borderPalette } from '../Theme'
import { Typography, TextProps } from "../Theme/typography"

export interface InputType
  extends PositionProps, LayoutProps, SpaceProps, SizeProps, BorderProps, TextProps {
  bg?: keyof typeof bgColorPalette
  boxShadow?: keyof typeof borderPalette
}

export type InputRootComponent = FC<Omit<ComponentProps<'input'>, keyof InputType>>

export const UnStyledInput = styled<InputRootComponent>('input' as unknown as InputRootComponent) <InputType>`
  ${position}
  ${layout}
  ${space}
  ${size}
  ${border}
  ${fontSize}
  ${fontWeight}
  ${fontFamily}
  ${fontStyle}
  ${textAlign}
`

export const Input = styled(UnStyledInput)`
  width: 100%;
  border-radius: 5px;
  padding: 7px 32px;
  border: none;
  background-color: ${bgColorPalette['bg/action-moderate']};
  ${() => Typography['input'] as any}
`
