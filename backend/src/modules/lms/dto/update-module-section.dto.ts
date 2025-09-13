import { PartialType } from "@nestjs/mapped-types";
import { CreateModuleSectionDto } from "./create-module-section.dto";

export class UpdateModuleSectionDto extends PartialType(CreateModuleSectionDto) {}