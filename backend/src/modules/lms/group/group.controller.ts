import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateDetailedGroupDto } from './dto/create-group.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('modules/:moduleId/groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  /**
   * Creates a new group
   *
   * @remarks
   * Requires `ADMIN` or `MENTOR` role
   *
   */
  @Post()
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  create(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Body() createGroupDto: CreateDetailedGroupDto,
  ) {
    return this.groupService.create(moduleId, createGroupDto);
  }

  /**
   * Retrieves groups of the given module id
   *
   * @remarks
   * Requires `ADMIN` or `MENTOR` role
   *
   */
  @Get()
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findAll(@Param('moduleId', new ParseUUIDPipe()) moduleId: string) {
    return this.groupService.findAll(moduleId);
  }

  /**
   * Updates a group
   *
   * @remarks
   * Requires `ADMIN` or `MENTOR` role
   *
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  /**
   * Deletes a group
   *
   * @remarks
   * Requires `ADMIN` or `MENTOR` role
   *
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}
