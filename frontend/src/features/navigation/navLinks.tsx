import type { NavItem } from '@/features/navigation/nav-button'
import {
  IconBell,
  IconBellFilled,
  IconBook,
  IconBookFilled,
  IconCashBanknote,
  IconCashBanknoteFilled,
  IconClipboardList,
  IconClipboardListFilled,
  IconGraph,
  IconGraphFilled,
  IconHomeFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react'

export const studentLinks: NavItem[] = [
  {
    link: '/dashboard',
    label: 'Dashboard',
    Icon: IconHomeFilled,
    IconInactive: IconHomeFilled,
    fuzzy: true,
  },
  {
    link: '/users',
    label: 'LMS',
    Icon: IconBookFilled,
    IconInactive: IconBook,
    fuzzy: true,
  },
  {
    link: '/enrollment',
    label: 'Enrollment',
    Icon: IconClipboardListFilled,
    IconInactive: IconClipboardList,
    fuzzy: true,
  },
  {
    link: '/billing',
    label: 'Billing',
    Icon: IconCashBanknoteFilled,
    IconInactive: IconCashBanknote,
    fuzzy: true,
  },
  {
    link: '/notifications',
    label: 'Notifications',
    Icon: IconBellFilled,
    IconInactive: IconBell,
    fuzzy: true,
  },
]

export const adminLinks: NavItem[] = [
  {
    link: '/dashboard',
    label: 'Dashboard',
    Icon: IconGraphFilled,
    IconInactive: IconGraph,
    fuzzy: true,
  },
  {
    link: '/users',
    label: 'Users',
    Icon: IconUserFilled,
    IconInactive: IconUser,
    fuzzy: true,
  },
  {
    link: '/billing',
    label: 'Billing',
    Icon: IconCashBanknoteFilled,
    IconInactive: IconCashBanknote,
    fuzzy: true,
  },
]
