declare global {
  namespace PrismaJson {
    type CostBreakdown = {
      category: string;
      name: string;
      cost: number;
    }[];
  }
}

export {};
