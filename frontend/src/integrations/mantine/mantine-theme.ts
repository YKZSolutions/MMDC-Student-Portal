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

const submissionStatusColors = {
  completed: colorsTuple('#008000'),
  pending: colorsTuple('#FFA500'),
  late: colorsTuple('#FF0000'),
  locked: colorsTuple('#808080'),
}

type CustomColors = keyof typeof customColors
type SubmissionStatusColors = keyof typeof submissionStatusColors

// Merge the Mantine's built in colors ya dig?
type ExtendedColors = DefaultMantineColor | CustomColors | SubmissionStatusColors

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedColors, MantineColorsTuple>
  }
}

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    ...customColors,
    ...submissionStatusColors
  },
})
