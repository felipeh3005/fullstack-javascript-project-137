import { describe, expect, test } from 'vitest'
import createId from '../src/utils.js'

describe('createId', () => {
  test('returns a string id', () => {
    const id = createId()

    expect(typeof id).toBe('string')
    expect(id.split('-')).toHaveLength(4)
  })

  test('returns different ids on consecutive calls', () => {
    const firstId = createId()
    const secondId = createId()

    expect(firstId).not.toBe(secondId)
  })
})
