import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../src/request.js', () => ({
  default: vi.fn(),
}))

vi.mock('../src/parser.js', () => ({
  default: vi.fn(),
}))

vi.mock('../src/utils.js', () => ({
  default: vi.fn(() => 'generated-id'),
}))

import fetchFeed from '../src/request.js'
import parseRss from '../src/parser.js'
import scheduleUpdates from '../src/updater.js'

const flushPromises = async (times = 6) => {
  for (let index = 0; index < times; index += 1) {
    await Promise.resolve()
  }
}

describe('scheduleUpdates', () => {
  let timeoutSpy

  beforeEach(() => {
    vi.clearAllMocks()
    timeoutSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation(() => 0)
  })

  afterEach(() => {
    timeoutSpy.mockRestore()
  })

  test('adds only new posts and schedules next update', async () => {
    fetchFeed.mockResolvedValue('<rss></rss>')
    parseRss.mockReturnValue({
      posts: [
        {
          title: 'Old post',
          link: 'https://example.com/posts/old',
          description: 'Old description',
        },
        {
          title: 'New post',
          link: 'https://example.com/posts/new',
          description: 'New description',
        },
      ],
    })

    const state = {
      feeds: [
        {
          id: 'feed-1',
          url: 'https://example.com/feed.xml',
        },
      ],
      posts: [
        {
          id: 'existing-id',
          feedId: 'feed-1',
          title: 'Old post',
          link: 'https://example.com/posts/old',
          description: 'Old description',
        },
      ],
    }

    scheduleUpdates(state)

    await flushPromises()

    expect(state.posts).toHaveLength(2)
    expect(state.posts[0]).toEqual({
      id: 'generated-id',
      feedId: 'feed-1',
      title: 'New post',
      link: 'https://example.com/posts/new',
      description: 'New description',
    })
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000)
  })

  test('does not break on failed feed request and still schedules next update', async () => {
    fetchFeed.mockRejectedValue(new Error('network failed'))

    const state = {
      feeds: [
        {
          id: 'feed-1',
          url: 'https://example.com/feed.xml',
        },
      ],
      posts: [],
    }

    scheduleUpdates(state)

    await flushPromises()

    expect(state.posts).toEqual([])
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000)
  })
})
