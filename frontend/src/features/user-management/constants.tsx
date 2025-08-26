import type { Role } from '@/integrations/api/client'
import {
  IconChalkboardTeacher,
  IconSchool,
  IconShield,
  IconUsers,
} from '@tabler/icons-react'

export const roleStyles: Record<
  Role,
  { border: string; backgroundColor: string; color: string }
> = {
  mentor: {
    border: '1px solid var(--mantine-color-green-9)',
    backgroundColor: 'var(--mantine-color-green-1)',
    color: 'var(--mantine-color-green-9)',
  },
  admin: {
    border: '1px solid var(--mantine-color-blue-9)',
    backgroundColor: 'var(--mantine-color-blue-1)',
    color: 'var(--mantine-color-blue-9)',
  },
  student: {
    border: '1px solid var(--mantine-color-violet-9)',
    backgroundColor: 'var(--mantine-color-violet-1)',
    color: 'var(--mantine-color-violet-9)',
  },
}

export const roleOptions = [
  {
    label: 'All roles',
    value: null,
    icon: <IconUsers size={16} />,
    color: 'gray',
  },
  {
    label: 'Mentor',
    value: 'mentor' as Role,
    icon: <IconChalkboardTeacher size={16} />,
    color: 'green',
  },
  {
    label: 'Student',
    value: 'student' as Role,
    icon: <IconSchool size={16} />,
    color: 'blue',
  },
  {
    label: 'Admin',
    value: 'admin' as Role,
    icon: <IconShield size={16} />,
    color: 'red',
  },
]
