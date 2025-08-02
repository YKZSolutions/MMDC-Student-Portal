import {
  colorsTuple,
  createTheme,
  type DefaultMantineColor,
  type MantineColorsTuple
} from '@mantine/core'

const customColors = {
  background: colorsTuple('#FAFAFA'),
  primary: colorsTuple('#123373'),
  secondary: colorsTuple('#F80507'),
} satisfies Record<string, MantineColorsTuple>

type CustomColors = keyof typeof customColors

// Merge the Mantine's built in colors ya dig?
type ExtendedColors = DefaultMantineColor | CustomColors

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedColors, MantineColorsTuple>
  }
}

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    ...customColors,
  },
})
