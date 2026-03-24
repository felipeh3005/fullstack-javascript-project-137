import './style.css';
import state from './state.js';
import initView from './view.js';
import validateUrl from './validation.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#rss-url'),
  feedback: document.querySelector('.feedback'),
};

initView(state, elements);

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

elements.input.addEventListener('input', () => {
  if (state.form.processState === 'invalid') {
    state.form.processState = 'filling';
    state.form.error = null;
  }
});
