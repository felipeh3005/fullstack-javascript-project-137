import { beforeEach, describe, expect, test, vi } from 'vitest'
import axios from 'axios'
import fetchFeed from '../src/request.js'

vi.mock('axios')

describe('fetchFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('requests allorigins proxy with expected params', async () => {
    axios.get.mockResolvedValue({
      data: {
        contents: '<rss></rss>',
      },
    })

    const url = 'https://example.com/feed.xml'

    await fetchFeed(url)

    expect(axios.get).toHaveBeenCalledWith('https://allorigins.hexlet.app/get', {
      params: {
        disableCache: true,
        url,
      },
    })
  })

  test('resolves response contents', async () => {
    axios.get.mockResolvedValue({
      data: {
        contents: '<rss><channel></channel></rss>',
      },
    })

    await expect(fetchFeed('https://example.com/feed.xml'))
      .resolves
      .toBe('<rss><channel></channel></rss>')
  })
})
