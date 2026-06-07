export type UserRole = 'student' | 'personal-trainer' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  phoneNumber?: string
  avatarUrl?: string
  city?: string
  state?: string
  isActive?: boolean
  isImpersonating?: boolean
  impersonatorId?: string
  createdAt?: string
}

export interface StoredUser extends AuthUser {
  passwordHash: string
  isActive: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  termsAccepted: boolean
}

export interface AuthValidationResult<T> {
  valid: boolean
  errors: T
}

export type LoginValidationErrors = Partial<Record<'email' | 'password', string>>
export type RegisterValidationErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirmPassword' | 'role' | 'termsAccepted', string>
>
