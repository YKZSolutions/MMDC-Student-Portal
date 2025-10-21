import type { NotificationMessages } from '@/integrations/tanstack-query/useAppMutation'
import { lowerCase } from 'lodash'
import { titleCase } from 'text-case'

export const toastMessage = (
  name: string,
  operationBefore: string,
  operationAfter: string,
  showError: boolean = true,
): NotificationMessages => ({
  loading: {
    title: `${titleCase(operationBefore)} ${titleCase(name)}`,
    message: `Please wait while ${titleCase(operationBefore)} the ${lowerCase(name)}`,
  },
  success: {
    title: `${titleCase(name)} ${titleCase(operationAfter)}`,
    message: `The ${lowerCase(name)} has been ${lowerCase(operationAfter)}.`,
  },
  ...(showError && {
    error: {
      title: `Failed ${titleCase(operationBefore)} ${titleCase(name)}`,
      message: `Something went wrong while ${operationBefore} the ${lowerCase(name)}`,
    },
  }),
})
