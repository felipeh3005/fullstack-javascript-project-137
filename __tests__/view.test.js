// @vitest-environment jsdom
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { proxy } from 'valtio/vanilla'
import initI18n from '../src/i18n.js'
import initView from '../src/view.js'

const flushUpdates = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

const createState = (overrides = {}) => proxy({
  form: {
    processState: 'filling',
    error: null,
    ...overrides.form,
  },
  feeds: overrides.feeds ?? [],
  posts: overrides.posts ?? [],
  ui: {
    readPostsIds: [],
    modalPostId: null,
    ...overrides.ui,
  },
})

const createElements = () => {
  document.body.innerHTML = `
    <form class="rss-form">
      <input id="rss-url" class="is-invalid is-valid" />
      <p class="feedback text-danger text-success">stale message</p>
    </form>
    <div class="feeds"></div>
    <div class="posts"></div>
    <h5 id="postModalLabel"></h5>
    <p class="modal-description"></p>
    <a class="modal-link" href="#"></a>
  `

  return {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#rss-url'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('#postModalLabel'),
    modalDescription: document.querySelector('.modal-description'),
    modalLink: document.querySelector('.modal-link'),
  }
}

beforeAll(async () => {
  await initI18n()
})

describe('initView', () => {
  test('renders placeholders and clears stale form state in filling mode', () => {
    const state = createState()
    const elements = createElements()

    initView(state, elements)

    expect(elements.input.classList.contains('is-invalid')).toBe(false)
    expect(elements.input.classList.contains('is-valid')).toBe(false)
    expect(elements.feedback.textContent).toBe('')
    expect(elements.feedsContainer.textContent).toContain('Feeds')
    expect(elements.feedsContainer.textContent).toContain('No feeds added yet.')
    expect(elements.postsContainer.textContent).toContain('Posts')
    expect(elements.postsContainer.textContent).toContain('No posts to display yet.')
    expect(elements.modalTitle.textContent).toBe('')
    expect(elements.modalDescription.textContent).toBe('')
    expect(elements.modalLink.getAttribute('href')).toBe('#')
  })

  test('reacts to invalid state updates and renders translated error', async () => {
    const state = createState()
    const elements = createElements()

    initView(state, elements)

    state.form.error = 'errors.invalidUrl'
    state.form.processState = 'invalid'

    await flushUpdates()

    expect(elements.input.classList.contains('is-invalid')).toBe(true)
    expect(elements.input.classList.contains('is-valid')).toBe(false)
    expect(elements.feedback.classList.contains('text-danger')).toBe(true)
    expect(elements.feedback.textContent).toBe('Debes ingresar una URL válida')
  })

  test('renders success state, resets form and focuses input', () => {
    const state = createState({
      form: {
        processState: 'added',
      },
    })
    const elements = createElements()
    const resetSpy = vi.spyOn(elements.form, 'reset')
    const focusSpy = vi.spyOn(elements.input, 'focus').mockImplementation(() => {})

    initView(state, elements)

    expect(resetSpy).toHaveBeenCalled()
    expect(focusSpy).toHaveBeenCalled()
    expect(elements.feedback.classList.contains('text-success')).toBe(true)
    expect(elements.feedback.textContent).toBe('El RSS se cargó correctamente')
  })

  test('renders sending state without feedback message', () => {
    const state = createState({
      form: {
        processState: 'sending',
      },
    })
    const elements = createElements()

    initView(state, elements)

    expect(elements.feedback.textContent).toBe('')
    expect(elements.feedback.classList.contains('text-danger')).toBe(false)
    expect(elements.feedback.classList.contains('text-success')).toBe(false)
  })

  test('renders feeds, posts, preview button and read status classes', () => {
    const state = createState({
      feeds: [
        {
          id: 'feed-1',
          title: 'Feed title',
          description: 'Feed description',
          url: 'https://example.com/feed.xml',
        },
      ],
      posts: [
        {
          id: 'post-1',
          feedId: 'feed-1',
          title: 'Unread post',
          link: 'https://example.com/posts/1',
          description: 'Description 1',
        },
        {
          id: 'post-2',
          feedId: 'feed-1',
          title: 'Read post',
          link: 'https://example.com/posts/2',
          description: 'Description 2',
        },
      ],
      ui: {
        readPostsIds: ['post-2'],
      },
    })
    const elements = createElements()

    initView(state, elements)

    expect(elements.feedsContainer.textContent).toContain('Feed title')
    expect(elements.feedsContainer.textContent).toContain('Feed description')

    const unreadLink = elements.postsContainer.querySelector('a[data-id="post-1"]')
    const readLink = elements.postsContainer.querySelector('a[data-id="post-2"]')
    const previewButton = elements.postsContainer.querySelector('button[data-id="post-1"]')

    expect(unreadLink.className).toContain('fw-bold')
    expect(readLink.className).toContain('fw-normal')
    expect(readLink.className).toContain('link-secondary')
    expect(previewButton.textContent.trim()).toBe('Vista previa')
  })

  test('renders modal content and uses fallback description when needed', () => {
    const state = createState({
      posts: [
        {
          id: 'post-1',
          feedId: 'feed-1',
          title: 'Modal post',
          link: 'https://example.com/posts/1',
          description: '',
        },
      ],
      ui: {
        modalPostId: 'post-1',
      },
    })
    const elements = createElements()

    initView(state, elements)

    expect(elements.modalTitle.textContent).toBe('Modal post')
    expect(elements.modalDescription.textContent)
      .toBe('Objetivo: aprender a extraer del árbol los datos necesarios')
    expect(elements.modalLink.getAttribute('href')).toBe('https://example.com/posts/1')
  })
})
