import type { DetailedBillDto } from '@/integrations/api/client'
import {
  IconCalendarEvent,
  IconCash,
  IconCircleDot,
  IconCreditCard,
  IconFileInvoice,
  IconMail,
  IconUser,
} from '@tabler/icons-react'
import dayjs from 'dayjs'

export function mapBillingDetails(invoice: DetailedBillDto) {
  return [
    {
      label: 'Invoice ID',
      value: invoice.invoiceId,
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
    // {
    //   label: 'Due Date',
    //   value: invoice.dueAt ? dayjs(invoice.dueAt).format('MMM D, YYYY') : '—',
    //   icon: IconCalendarEvent,
    // },
    {
      label: 'Date Issued',
      value: dayjs(invoice.createdAt).format('MMM D, YYYY'),
      icon: IconCalendarEvent,
    },
    {
      label: 'Status',
      value: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
      icon: IconCircleDot,
    },
    {
      label: 'Payment Scheme',
      value: invoice.paymentScheme !== 'full' ? 'Installments' : 'Full Payment',
      icon: IconCreditCard,
    },
    {
      label: 'Total Amount',
      value: `₱ ${invoice.totalAmount}`,
      icon: IconFileInvoice,
    },
    {
      label: 'Amount Paid',
      value: `₱ ${invoice.totalPaid}`,
      icon: IconCash,
    },
  ]
}
