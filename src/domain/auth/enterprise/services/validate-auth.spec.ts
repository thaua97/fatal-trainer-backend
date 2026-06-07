import { describe, expect, it } from 'vitest'
import { validateLogin, validateRegister } from './validate-auth'

describe('validate-auth', () => {
  it('validates login payload', () => {
    expect(validateLogin({ email: '', password: '' }).valid).toBe(false)
    expect(validateLogin({ email: 'user@example.com', password: '123456' }).valid).toBe(true)
  })

  it('validates register payload', () => {
    expect(
      validateRegister({
        name: 'Ana',
        email: 'ana@example.com',
        password: '123456',
        confirmPassword: '123456',
        role: 'student',
        termsAccepted: true,
      }).valid,
    ).toBe(true)
  })
})
