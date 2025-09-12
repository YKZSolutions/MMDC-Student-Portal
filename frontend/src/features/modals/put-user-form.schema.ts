import {
  zUsersControllerCreateData,
  zUsersControllerCreateStaffData,
  zUsersControllerCreateStudentData,
} from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodUserCreate = zUsersControllerCreateData.shape.body.shape
const zodUser = zodUserCreate.user.shape
const zodUserDetails = zodUserCreate.userDetails.unwrap().shape

export const MainFormSchema = z.object({
  ...zodUserCreate,
  role: zodUserCreate.role,
  profileImage: z.file().nullable(),
  user: z.object({
    ...zodUserCreate.user.shape,
    firstName: zodUser.firstName.nonempty('Should not be empty'),
    lastName: zodUser.lastName.nonempty('Should not be empty'),
  }),
  userDetails: z.object({
    ...zodUserDetails,
  }),
})

export type MainFormValues = z.infer<typeof MainFormSchema>

const zodStudent = zUsersControllerCreateStudentData.shape.body.shape
const zodStudentSpecificDetails = zodStudent.specificDetails.shape

export const StudentFormSchema = z.object({
  ...zodStudentSpecificDetails,
  studentNumber: nullableInput(
    zodStudentSpecificDetails.studentNumber,
    'Student number is required',
  ),
  studentType: nullableInput(
    zodStudentSpecificDetails.studentType,
    'Student type is required',
  ),
  admissionDate: nullableInput(
    zodStudentSpecificDetails.admissionDate,
    'Admission Date is required',
  ),
})

export type StudentFormInput = z.input<typeof StudentFormSchema>
export type StudentFormOutput = z.output<typeof StudentFormSchema>

const zodStaff = zUsersControllerCreateStaffData.shape.body.shape
const zodStaffSpecificDetails = zodStaff.specificDetails.shape

export const StaffFormSchema = z.object({
  ...zodStaffSpecificDetails,
  employeeNumber: nullableInput(
    zodStaffSpecificDetails.employeeNumber,
    'Employee number is required',
  ),
  department: nullableInput(
    zodStaffSpecificDetails.department,
    'Department is required',
  ),
  position: nullableInput(
    zodStaffSpecificDetails.position,
    'Position is required',
  ),
})

export type StaffFormInput = z.input<typeof StaffFormSchema>
export type StaffFormOutput = z.output<typeof StaffFormSchema>
