import type { BillDto } from "@/integrations/api/client";
import { IconCalendarEvent, IconCash, IconFileInvoice, IconMail, IconReceipt2, IconReportMoney, IconSchool, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";

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
      label: 'Bill Type',
      value: invoice.billType,
      icon: IconSchool,
    },
    {
      label: 'Receivable Amount',
      value: Number(invoice.receivableAmount).toLocaleString(),
      icon: IconCash,
    },
    {
      label: 'Receipted Amount',
      value: Number(invoice.receiptedAmount).toLocaleString(),
      icon: IconReceipt2,
    },
    {
      label: 'Outstanding Amount',
      value: Number(invoice.outstandingAmount).toLocaleString(),
      icon: IconReportMoney,
    },
  ]
}
