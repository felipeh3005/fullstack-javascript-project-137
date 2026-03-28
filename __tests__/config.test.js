import { describe, expect, test } from 'vitest'
import state from '../src/state.js'
import resources from '../src/locales.js'
import initI18n, { i18next } from '../src/i18n.js'

describe('state', () => {
  test('contains expected initial structure', () => {
    expect(state).toMatchObject({
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
    })
  })
})

describe('locales', () => {
  test('contains expected spanish translations', () => {
    expect(resources.es.translation.form.label).toBe('RSS link')
    expect(resources.es.translation.form.submit).toBe('Añadir')
    expect(resources.es.translation.form.success).toBe('El RSS se cargó correctamente')
    expect(resources.es.translation.errors.duplicate).toBe('El RSS ya existe')
    expect(resources.es.translation.buttons.preview).toBe('Vista previa')
    expect(resources.es.translation.sections.feeds).toBe('Feeds')
    expect(resources.es.translation.modal.fallbackDescription)
      .toBe('Objetivo: aprender a extraer del árbol los datos necesarios')
  })
})

describe('i18n', () => {
  test('initializes i18next with spanish locale', async () => {
    await initI18n()

    expect(i18next.language).toBe('es')
    expect(i18next.t('form.submit')).toBe('Añadir')
    expect(i18next.t('errors.network')).toBe('Error de red')
  })
})
