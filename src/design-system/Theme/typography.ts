import {
  SpaceProps,
  FontFamilyProps,
  FontSizeProps,
  FontStyleProps,
  FontWeightProps,
  TextColorProps,
  TextStyleProps,
  LineHeightProps,
  TextAlignProps
} from 'styled-system'
import { palette } from './palette'

export interface TextProps extends
  SpaceProps,
  FontFamilyProps,
  FontSizeProps,
  FontStyleProps,
  FontWeightProps,
  TextColorProps,
  TextStyleProps,
  LineHeightProps,
  TextAlignProps { }


export const Typography: Record<string, TextProps> = {
  'title': {
    fontSize: '20px',
    fontFamily: 'Montserrat',
    fontWeight: 700,
    lineHeight: 'normal',
    color: palette['black-100'],
  },
  'label-major': {
    fontSize: '11px',
    fontFamily: 'Montserrat',
    fontWeight: 500,
    lineHeight: 'normal',
    color: palette['black-100'],
  },
  'label-minor': {
    fontSize: '11px',
    fontFamily: 'Montserrat',
    fontWeight: 400,
    lineHeight: 'normal',
    color: palette['black-100'],
  },
  'input': {
    fontSize: '12px',
    fontFamily: 'Montserrat',
    fontWeight: 400,
    lineHeight: 'normal',
    color: palette['black-100'],
  }
}
