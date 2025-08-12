import {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/modules/users/dto/user-details.dto';

export class PromptDto {
  sessionId: string;
  prompt: string;
  user: UserStudentDetailsDto | UserStaffDetailsDto;
}
