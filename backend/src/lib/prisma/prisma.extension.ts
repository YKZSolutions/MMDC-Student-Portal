import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

export const extendedPrismaClient = new PrismaClient().$extends(pagination());

export type ExtendedPrismaClient = typeof extendedPrismaClient;

export type PrismaTransaction = Parameters<
  Parameters<ExtendedPrismaClient['$transaction']>[0]
>[0];
