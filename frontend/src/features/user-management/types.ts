import type { Role } from "@/integrations/api/client"

export interface IUsersQuery {
  search: string
  page: number
  role: Role | null
}