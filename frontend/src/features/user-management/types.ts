import type { Role } from "@/integrations/api/client"

export interface IQuery {
  search: string
  page: number
  role: Role | null
}