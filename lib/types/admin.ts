import type { UserProfileDTO, UserToUpdateDTO } from "@/lib/types/user"

export interface AdminUserCreateDTO {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

export type AdminUser = UserProfileDTO

export type AdminUserUpdateDTO = UserToUpdateDTO
