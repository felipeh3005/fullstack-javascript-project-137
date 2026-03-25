import './style.css';
import state from './state.js';
import initView from './view.js';
import validateUrl from './validation.js';
import initI18n, { i18next } from './i18n.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#rss-url'),
  feedback: document.querySelector('.feedback'),
  label: document.querySelector('label[for="rss-url"]'),
  submit: document.querySelector('.rss-form button[type="submit"]'),
};

const renderStaticTexts = () => {
  elements.label.textContent = i18next.t('form.label');
  elements.submit.textContent = i18next.t('form.submit');
};

const handleSuccess = (url) => {
  state.feeds.push(url);
  state.form.error = null;
  state.form.processState = 'added';

  return Promise.resolve().then(() => {
    state.form.processState = 'filling';
  });
};

const handleError = (error) => {
  state.form.error = error.message;
  state.form.processState = 'invalid';
};

const watchInput = () => {
  elements.input.addEventListener('input', () => {
    if (state.form.processState === 'invalid') {
      state.form.processState = 'filling';
      state.form.error = null;
    }
  });
};

const watchForm = () => {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(elements.form);
    const url = formData.get('url');

    state.form.error = null;
    state.form.processState = 'filling';

    validateUrl(url, state.feeds)
      .then(handleSuccess)
      .catch(handleError);
  });
};

initI18n().then(() => {
  renderStaticTexts();
  initView(state, elements);
  watchInput();
  watchForm();
});
