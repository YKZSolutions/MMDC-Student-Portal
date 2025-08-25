import {
  colorsTuple,
  createTheme,
  type DefaultMantineColor,
  type MantineColorsTuple
} from '@mantine/core'

const customColors = {
  background: colorsTuple('#FAFAFA'),
  primary: colorsTuple('#123373'),
  secondary: colorsTuple('#BE0000'),
} satisfies Record<string, MantineColorsTuple>

const statusColors = {
  completed: colorsTuple('#65c66d'),
  submitted: colorsTuple('#65c66d'),

  open: colorsTuple('#65c66d'),
  closed: colorsTuple('#cbced2'),

  pending: colorsTuple('#F57C69'),
  draft: colorsTuple('#cbced2'),
  late: colorsTuple('#F57C69'),
  'ready-for-grading': colorsTuple('#F9BD34'),
  graded: colorsTuple('#65c66d'),
}

type CustomColors = keyof typeof customColors
type StatusColors = keyof typeof statusColors

// Merge the Mantine's built in colors ya dig?
type ExtendedColors = DefaultMantineColor | CustomColors | StatusColors

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedColors, MantineColorsTuple>
  }
}

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    ...customColors,
    ...statusColors
  },
})
