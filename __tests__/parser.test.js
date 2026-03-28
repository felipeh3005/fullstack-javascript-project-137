// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import parseRss from '../src/parser.js'

describe('parseRss', () => {
  test('parses feed and posts from valid rss xml', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <description>Feed description</description>
          <item>
            <title>Post 1</title>
            <link>https://example.com/posts/1</link>
            <description>Description 1</description>
          </item>
          <item>
            <title>Post 2</title>
            <link>https://example.com/posts/2</link>
            <description>Description 2</description>
          </item>
        </channel>
      </rss>`

    const result = parseRss(xml)

    expect(result.feed).toEqual({
      title: 'Test Feed',
      description: 'Feed description',
    })

    expect(result.posts).toEqual([
      {
        title: 'Post 1',
        link: 'https://example.com/posts/1',
        description: 'Description 1',
      },
      {
        title: 'Post 2',
        link: 'https://example.com/posts/2',
        description: 'Description 2',
      },
    ])
  })

  test('throws parse error for malformed xml', () => {
    const xml = '<rss><channel><title>Broken</title></channel>'

    expect(() => parseRss(xml)).toThrow('errors.parse')
  })

  test('throws parse error when required elements are missing', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Missing description</title>
        </channel>
      </rss>`

    expect(() => parseRss(xml)).toThrow('errors.parse')
  })
})
