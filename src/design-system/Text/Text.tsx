import React, { FC, ComponentProps } from "react"
import styled from "styled-components"
import {
  space,
  color,
  size,
  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  textAlign,
} from "styled-system"
import { Typography, TextProps } from "../Theme/typography"

interface TextType
  extends TextProps {
  children: React.ReactNode
  variation: keyof typeof Typography
}

export type TextRootComponent = FC<Omit<ComponentProps<'p'>, keyof TextType>>

export const Text = styled<TextRootComponent>('p' as unknown as TextRootComponent) <TextType>`
  margin: 0;
  ${space}
  ${color}
  ${size}
  ${fontSize}
  ${fontWeight}
  ${fontFamily}
  ${fontStyle}
  ${textAlign}
  ${({ variation }) => {
    if (!variation) return null as any
    return Typography[variation]
  }}
`
