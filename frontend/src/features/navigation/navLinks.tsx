import type { NavItem } from '@/features/navigation/nav-button'
import {
  IconBell,
  IconBellFilled,
  IconBook,
  IconBookFilled,
  IconBooks,
  IconCashBanknote,
  IconCashBanknoteFilled,
  IconClipboardList,
  IconClipboardListFilled,
  IconGraph,
  IconGraphFilled,
  IconHome,
  IconHomeFilled,
  IconSchool,
  IconUser,
  IconUserCog,
  IconUserFilled,
  IconVocabulary,
} from '@tabler/icons-react'

export const studentLinks: NavItem[] = [
  {
    link: '/dashboard',
    label: 'Dashboard',
    Icon: IconHomeFilled,
    IconInactive: IconHome,
    fuzzy: true,
  },
  {
    link: '/lms',
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
  {
    link: '/profile',
    label: 'Profile',
    Icon: IconUserFilled,
    IconInactive: IconUser,
    fuzzy: true,
  },
]

export const mentorLinks: NavItem[] = [
  {
    link: '/dashboard',
    label: 'Dashboard',
    Icon: IconHomeFilled,
    IconInactive: IconHome,
    fuzzy: true,
  },
  {
    link: '/lms',
    label: 'LMS',
    Icon: IconBookFilled,
    IconInactive: IconBook,
    fuzzy: true,
  },
  {
    link: '/notifications',
    label: 'Notifications',
    Icon: IconBellFilled,
    IconInactive: IconBell,
    fuzzy: true,
  },
  {
    link: '/profile',
    label: 'Profile',
    Icon: IconUserFilled,
    IconInactive: IconUser,
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
    link: '/lms',
    label: 'LMS',
    Icon: IconBookFilled,
    IconInactive: IconBook,
    fuzzy: true,
  },
  {
    link: '/users',
    label: 'Users',
    Icon: IconUserCog,
    IconInactive: IconUserCog,
    fuzzy: true,
  },
  {
    link: '/curriculum',
    label: 'Curriculum',
    Icon: IconSchool,
    IconInactive: IconSchool,
    fuzzy: true,
    subItems: [
      {
        link: '/curriculum/programs',
        label: 'Programs',
        Icon: IconVocabulary,
        IconInactive: IconVocabulary,
        fuzzy: true,
      },
      {
        link: '/curriculum/courses',
        label: 'Courses',
        Icon: IconBooks,
        IconInactive: IconBooks,
        fuzzy: true,
      },
    ],
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
    subItems: [
      {
        link: '/pricing',
        label: 'Pricing',
        Icon: IconGraphFilled,
        IconInactive: IconGraph,
        fuzzy: true,
      },
    ],
  },
  {
    link: '/profile',
    label: 'Profile',
    Icon: IconUserFilled,
    IconInactive: IconUser,
    fuzzy: true,
  },
]
