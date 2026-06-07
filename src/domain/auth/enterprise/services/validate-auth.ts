import { AUTH_PASSWORD_MIN_LENGTH, isValidEmail } from '../constants/auth-options'
import type {
  AuthValidationResult,
  LoginPayload,
  LoginValidationErrors,
  RegisterPayload,
  RegisterValidationErrors,
} from '../entities/user'

export function validateLogin(payload: LoginPayload): AuthValidationResult<LoginValidationErrors> {
  const errors: LoginValidationErrors = {}

  const email = payload.email.trim()
  if (!email) {
    errors.email = 'required'
  } else if (!isValidEmail(email)) {
    errors.email = 'invalid'
  }

  if (!payload.password) {
    errors.password = 'required'
  } else if (payload.password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = 'tooShort'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateRegister(
  payload: RegisterPayload,
): AuthValidationResult<RegisterValidationErrors> {
  const errors: RegisterValidationErrors = {}

  const name = payload.name.trim()
  if (!name) {
    errors.name = 'required'
  } else if (name.length < 2) {
    errors.name = 'tooShort'
  }

  if (!payload.role) {
    errors.role = 'required'
  }

  const email = payload.email.trim()
  if (!email) {
    errors.email = 'required'
  } else if (!isValidEmail(email)) {
    errors.email = 'invalid'
  }

  if (!payload.password) {
    errors.password = 'required'
  } else if (payload.password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = 'tooShort'
  }

  if (!payload.confirmPassword) {
    errors.confirmPassword = 'required'
  } else if (payload.password !== payload.confirmPassword) {
    errors.confirmPassword = 'mismatch'
  }

  if (!payload.termsAccepted) {
    errors.termsAccepted = 'required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
