export const omitAuditDates = {
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const omitPublishFields = {
  publishedAt: true,
  toPublishAt: true,
  publishedBy: true,
} as const;
