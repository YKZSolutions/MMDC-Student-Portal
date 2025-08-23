import type { BillDto } from '@/integrations/api/client'
import {
  IconCalendarEvent,
  IconFileInvoice,
  IconMail,
  IconSchool,
  IconUser
} from '@tabler/icons-react'
import dayjs from 'dayjs'

export function mapBillingDetails(invoice: BillDto) {
  return [
    {
      label: 'Invoice ID',
      value: invoice.id,
      icon: IconFileInvoice,
    },
    {
      label: 'Payer Name',
      value: invoice.payerName,
      icon: IconUser,
    },
    {
      label: 'Payer Email',
      value: invoice.payerEmail,
      icon: IconMail,
    },
    {
      label: 'Due Date',
      value: invoice.dueAt ? dayjs(invoice.dueAt).format('MMM D, YYYY') : '—',
      icon: IconCalendarEvent,
    },
    {
      label: 'Payment Scheme',
      value: invoice.paymentScheme,
      icon: IconSchool,
    },
  ]
}
