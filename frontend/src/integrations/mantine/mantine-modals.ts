import EnrollmentCourseCreateModal from '@/features/modals/enrollment-course-create-modal'
import EwalletModal from '@/features/modals/ewallet-modal'
import PutUserModal from '@/features/modals/put-user.admin'

export const modals = {
  ewallet: EwalletModal,
  putUser: PutUserModal,
  enrollmentCourseCreate: EnrollmentCourseCreateModal,
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals
  }
}
