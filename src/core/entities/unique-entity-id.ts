import { randomUUID } from 'node:crypto'

export class UniqueEntityID {
  private readonly value: string

  constructor(id?: string) {
    this.value = id ?? randomUUID()
  }

  toString(): string {
    return this.value
  }

  toValue(): string {
    return this.value
  }

  equals(id: UniqueEntityID): boolean {
    return id.toValue() === this.value
  }
}
