import { describe, expect, test } from 'vitest'
import validateUrl from '../src/validation.js'

describe('validateUrl', () => {
  test('rejects empty value', async () => {
    await expect(validateUrl('', [])).rejects.toThrow('errors.required')
  })

  test('rejects invalid url', async () => {
    await expect(validateUrl('abc', [])).rejects.toThrow('errors.invalidUrl')
  })

  test('rejects duplicate url', async () => {
    const url = 'https://example.com/feed.xml'

    await expect(validateUrl(url, [url])).rejects.toThrow('errors.duplicate')
  })

  test('resolves valid unique url', async () => {
    const url = 'https://example.com/feed.xml'

    await expect(validateUrl(url, [])).resolves.toBe(url)
  })
})
