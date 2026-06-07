import { describe, expect, it } from 'vitest'
import { UniqueEntityID } from './unique-entity-id'
import { Entity } from './entity'

class TestEntity extends Entity<{ name: string }> {
  static create(name: string, id?: UniqueEntityID) {
    return new TestEntity({ name }, id)
  }

  get name() {
    return this.props.name
  }
}

describe('core entities', () => {
  it('compares entity ids', () => {
    const id = new UniqueEntityID('abc')
    const entity = TestEntity.create('Ana', id)

    expect(entity.id.toString()).toBe('abc')
    expect(entity.equals(TestEntity.create('Ana', id))).toBe(true)
    expect(entity.equals(undefined)).toBe(false)
  })
})
