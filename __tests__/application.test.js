// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest'

const {
  mockState,
  mockInitView,
  mockValidateUrl,
  mockInitI18n,
  mockI18next,
  mockFetchFeed,
  mockParseRss,
  mockScheduleUpdates,
  mockCreateId,
  MockModal,
} = vi.hoisted(() => {
  const state = {
    form: {
      processState: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    ui: {
      readPostsIds: [],
      modalPostId: null,
    },
  }

  return {
    mockState: state,
    mockInitView: vi.fn(),
    mockValidateUrl: vi.fn(),
    mockInitI18n: vi.fn(() => Promise.resolve()),
    mockI18next: {
      t: vi.fn((key) => {
        const translations = {
          'form.label': 'RSS link',
          'form.submit': 'Añadir',
          'buttons.close': 'Cerrar',
          'buttons.readFull': 'Leer completo',
        }

        return translations[key] ?? key
      }),
    },
    mockFetchFeed: vi.fn(),
    mockParseRss: vi.fn(),
    mockScheduleUpdates: vi.fn(),
    mockCreateId: vi.fn()
      .mockReturnValueOnce('feed-id')
      .mockReturnValueOnce('post-id-1')
      .mockReturnValueOnce('post-id-2'),
    MockModal: vi.fn(function MockModal() {
      this.show = vi.fn()
    }),
  }
})

vi.mock('../src/state.js', () => ({
  default: mockState,
}))

vi.mock('../src/view.js', () => ({
  default: mockInitView,
}))

vi.mock('../src/validation.js', () => ({
  default: mockValidateUrl,
}))

vi.mock('../src/i18n.js', () => ({
  default: mockInitI18n,
  i18next: mockI18next,
}))

vi.mock('../src/request.js', () => ({
  default: mockFetchFeed,
}))

vi.mock('../src/parser.js', () => ({
  default: mockParseRss,
}))

vi.mock('../src/updater.js', () => ({
  default: mockScheduleUpdates,
}))

vi.mock('../src/utils.js', () => ({
  default: mockCreateId,
}))

vi.mock('bootstrap/js/dist/modal.js', () => ({
  default: MockModal,
}))

import initApplication, {
  addFeedDataToState,
  createElements,
  createFeed,
  createPosts,
  getErrorKey,
  getFeedUrls,
  markPostAsRead,
  renderStaticTexts,
} from '../src/application.js'

const createDom = () => {
  document.body.innerHTML = `
    <form class="rss-form">
      <label for="rss-url"></label>
      <input id="rss-url" name="url" />
      <button type="submit"></button>
      <p class="feedback"></p>
    </form>
    <div class="feeds"></div>
    <div class="posts">
      <button class="preview-button" data-id="post-1">Vista previa</button>
      <a data-id="post-2" href="https://example.com/posts/2">Post 2</a>
    </div>
    <div id="modal"></div>
    <h5 id="postModalLabel"></h5>
    <p class="modal-description"></p>
    <a class="modal-link" href="#"></a>
    <div class="modal-footer">
      <button class="btn-secondary"></button>
    </div>
  `
}

beforeEach(() => {
  createDom()

  mockState.form.processState = 'filling'
  mockState.form.error = null
  mockState.feeds = []
  mockState.posts = []
  mockState.ui.readPostsIds = []
  mockState.ui.modalPostId = null

  mockInitView.mockClear()
  mockValidateUrl.mockReset()
  mockInitI18n.mockClear()
  mockI18next.t.mockClear()
  mockFetchFeed.mockReset()
  mockParseRss.mockReset()
  mockScheduleUpdates.mockClear()
  mockCreateId.mockReset()
  mockCreateId
    .mockReturnValueOnce('feed-id')
    .mockReturnValueOnce('post-id-1')
    .mockReturnValueOnce('post-id-2')
  MockModal.mockClear()
})

describe('application helpers', () => {
  test('createElements returns expected dom references', () => {
    const elements = createElements()

    expect(elements.form).toBe(document.querySelector('.rss-form'))
    expect(elements.input).toBe(document.querySelector('#rss-url'))
    expect(elements.postsContainer).toBe(document.querySelector('.posts'))
    expect(elements.modalElement).toBe(document.querySelector('#modal'))
  })

  test('renderStaticTexts fills translated static content', () => {
    const elements = createElements()

    renderStaticTexts(elements)

    expect(elements.label.textContent).toBe('RSS link')
    expect(elements.submit.textContent).toBe('Añadir')
    expect(elements.modalCloseButton.textContent).toBe('Cerrar')
    expect(elements.modalLink.textContent).toBe('Leer completo')
  })

  test('getFeedUrls extracts urls from feeds', () => {
    const urls = getFeedUrls([
      { url: 'https://example.com/feed-1.xml' },
      { url: 'https://example.com/feed-2.xml' },
    ])

    expect(urls).toEqual([
      'https://example.com/feed-1.xml',
      'https://example.com/feed-2.xml',
    ])
  })

  test('createFeed builds feed with generated id', () => {
    mockCreateId.mockReset()
    mockCreateId.mockReturnValue('generated-feed-id')

    const feed = createFeed('https://example.com/feed.xml', {
      title: 'Feed title',
      description: 'Feed description',
    })

    expect(feed).toEqual({
      id: 'generated-feed-id',
      url: 'https://example.com/feed.xml',
      title: 'Feed title',
      description: 'Feed description',
    })
  })

  test('createPosts builds posts with generated ids', () => {
    mockCreateId.mockReset()
    mockCreateId
      .mockReturnValueOnce('generated-post-id-1')
      .mockReturnValueOnce('generated-post-id-2')

    const posts = createPosts('feed-id', [
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

    expect(posts).toEqual([
      {
        id: 'generated-post-id-1',
        feedId: 'feed-id',
        title: 'Post 1',
        link: 'https://example.com/posts/1',
        description: 'Description 1',
      },
      {
        id: 'generated-post-id-2',
        feedId: 'feed-id',
        title: 'Post 2',
        link: 'https://example.com/posts/2',
        description: 'Description 2',
      },
    ])
  })

  test('addFeedDataToState stores feed and posts in state', () => {
    addFeedDataToState('https://example.com/feed.xml', {
      feed: {
        title: 'Feed title',
        description: 'Feed description',
      },
      posts: [
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
      ],
    })

    expect(mockState.feeds).toEqual([
      {
        id: 'feed-id',
        url: 'https://example.com/feed.xml',
        title: 'Feed title',
        description: 'Feed description',
      },
    ])

    expect(mockState.posts).toEqual([
      {
        id: 'post-id-1',
        feedId: 'feed-id',
        title: 'Post 1',
        link: 'https://example.com/posts/1',
        description: 'Description 1',
      },
      {
        id: 'post-id-2',
        feedId: 'feed-id',
        title: 'Post 2',
        link: 'https://example.com/posts/2',
        description: 'Description 2',
      },
    ])
  })

  test('markPostAsRead adds only missing ids', () => {
    markPostAsRead('post-1')
    markPostAsRead('post-1')

    expect(mockState.ui.readPostsIds).toEqual(['post-1'])
  })

  test('getErrorKey returns existing app error keys and network fallback', () => {
    expect(getErrorKey(new Error('errors.parse'))).toBe('errors.parse')
    expect(getErrorKey(new Error('unexpected'))).toBe('errors.network')
  })
})

describe('initApplication', () => {
  test('initializes view, texts and updater', async () => {
    await initApplication()

    expect(mockInitI18n).toHaveBeenCalled()
    expect(mockInitView).toHaveBeenCalledWith(mockState, expect.objectContaining({
      form: document.querySelector('.rss-form'),
      input: document.querySelector('#rss-url'),
    }))
    expect(mockScheduleUpdates).toHaveBeenCalledWith(mockState)
    expect(document.querySelector('label[for="rss-url"]').textContent).toBe('RSS link')
    expect(document.querySelector('.btn-secondary').textContent).toBe('Cerrar')
  })

  test('handles successful form submission', async () => {
    mockValidateUrl.mockResolvedValue('https://example.com/feed.xml')
    mockFetchFeed.mockResolvedValue('<rss></rss>')
    mockParseRss.mockReturnValue({
      feed: {
        title: 'Feed title',
        description: 'Feed description',
      },
      posts: [
        {
          title: 'Post 1',
          link: 'https://example.com/posts/1',
          description: 'Description 1',
        },
      ],
    })

    await initApplication()

    const form = document.querySelector('.rss-form')
    const input = document.querySelector('#rss-url')
    input.value = 'https://example.com/feed.xml'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockValidateUrl).toHaveBeenCalledWith('https://example.com/feed.xml', [])
    expect(mockFetchFeed).toHaveBeenCalledWith('https://example.com/feed.xml')
    expect(mockParseRss).toHaveBeenCalledWith('<rss></rss>')
    expect(mockState.form.processState).toBe('added')
    expect(mockState.feeds).toHaveLength(1)
    expect(mockState.posts).toHaveLength(1)
  })

  test('handles failed validation', async () => {
    mockValidateUrl.mockRejectedValue(new Error('errors.invalidUrl'))

    await initApplication()

    const form = document.querySelector('.rss-form')
    const input = document.querySelector('#rss-url')
    input.value = 'abc'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await Promise.resolve()

    expect(mockState.form.processState).toBe('invalid')
    expect(mockState.form.error).toBe('errors.invalidUrl')
  })

  test('clears form state on input after invalid and added status', async () => {
    await initApplication()

    const input = document.querySelector('#rss-url')

    mockState.form.processState = 'invalid'
    mockState.form.error = 'errors.invalidUrl'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(mockState.form.processState).toBe('filling')
    expect(mockState.form.error).toBe(null)

    mockState.form.processState = 'added'
    mockState.form.error = 'errors.invalidUrl'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(mockState.form.processState).toBe('filling')
    expect(mockState.form.error).toBe(null)
  })

  test('marks posts as read on preview click and link click', async () => {
    await initApplication()

    const postsContainer = document.querySelector('.posts')
    const previewButton = postsContainer.querySelector('.preview-button')
    const postLink = postsContainer.querySelector('a[data-id="post-2"]')

    previewButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(mockState.ui.readPostsIds).toContain('post-1')
    expect(mockState.ui.modalPostId).toBe('post-1')
    expect(MockModal.mock.instances[0].show).toHaveBeenCalled()

    postLink.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(mockState.ui.readPostsIds).toContain('post-2')
  })
})
