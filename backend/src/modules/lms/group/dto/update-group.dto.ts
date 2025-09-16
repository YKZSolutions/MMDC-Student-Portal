import { PartialType } from '@nestjs/swagger';
import { CreateDetailedGroupDto } from './create-group.dto';

export class UpdateGroupDto extends PartialType(CreateDetailedGroupDto) {}
