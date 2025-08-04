import { SetMetadata } from '@nestjs/common';

export const IS_STATUS_BYPASS = 'isStatusBypass';
export const StatusBypass = () => SetMetadata(IS_STATUS_BYPASS, true);
