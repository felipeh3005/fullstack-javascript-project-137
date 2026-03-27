import './style.css';
import state from './state.js';
import initView from './view.js';
import validateUrl from './validation.js';
import initI18n, { i18next } from './i18n.js';
import fetchFeed from './request.js';
import parseRss from './parser.js';
import scheduleUpdates from './updater.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#rss-url'),
  feedback: document.querySelector('.feedback'),
  label: document.querySelector('label[for="rss-url"]'),
  submit: document.querySelector('.rss-form button[type="submit"]'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
};

const renderStaticTexts = () => {
  elements.label.textContent = i18next.t('form.label');
  elements.submit.textContent = i18next.t('form.submit');
};

const getFeedUrls = (feeds) => feeds.map((feed) => feed.url);

const createFeed = (url, feed) => ({
  id: crypto.randomUUID(),
  url,
  ...feed,
});

const createPosts = (feedId, posts) => posts.map((post) => ({
  id: crypto.randomUUID(),
  feedId,
  ...post,
}));

const addFeedDataToState = (url, data) => {
  const feed = createFeed(url, data.feed);
  const posts = createPosts(feed.id, data.posts);

  state.feeds.push(feed);
  state.posts.push(...posts);
};

const handleSuccess = (url, data) => {
  addFeedDataToState(url, data);
  state.form.error = null;
  state.form.processState = 'added';

  return Promise.resolve().then(() => {
    state.form.processState = 'filling';
  });
};

const getErrorKey = (error) => {
  if (error.message === 'errors.parse') {
    return 'errors.parse';
  }

  return 'errors.network';
};

const handleError = (error) => {
  state.form.error = getErrorKey(error);
  state.form.processState = 'invalid';
};

const processFeed = (url) => fetchFeed(url)
  .then(parseRss)
  .then((data) => handleSuccess(url, data))
  .catch(handleError);

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
    state.form.processState = 'sending';

    validateUrl(url, getFeedUrls(state.feeds))
      .then(processFeed)
      .catch(handleError);
  });
};

initI18n().then(() => {
  renderStaticTexts();
  initView(state, elements);
  watchInput();
  watchForm();
  scheduleUpdates(state);
});
