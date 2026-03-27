import './style.css';
import Modal from 'bootstrap/js/dist/modal.js';
import state from './state.js';
import initView from './view.js';
import validateUrl from './validation.js';
import initI18n, { i18next } from './i18n.js';
import fetchFeed from './request.js';
import parseRss from './parser.js';
import scheduleUpdates from './updater.js';
import createId from './utils.js';

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#rss-url'),
  feedback: document.querySelector('.feedback'),
  label: document.querySelector('label[for="rss-url"]'),
  submit: document.querySelector('.rss-form button[type="submit"]'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  modalElement: document.querySelector('#modal'),
  modalTitle: document.querySelector('#postModalLabel'),
  modalDescription: document.querySelector('.modal-description'),
  modalLink: document.querySelector('.modal-link'),
  modalCloseButton: document.querySelector('.modal-footer .btn-secondary'),
};

const modal = new Modal(elements.modalElement);

const renderStaticTexts = () => {
  elements.label.textContent = i18next.t('form.label');
  elements.submit.textContent = i18next.t('form.submit');
  elements.modalCloseButton.textContent = i18next.t('buttons.close');
  elements.modalLink.textContent = i18next.t('buttons.readFull');
};

const getFeedUrls = (feeds) => feeds.map((feed) => feed.url);

const createFeed = (url, feed) => ({
  id: createId(),
  url,
  ...feed,
});

const createPosts = (feedId, posts) => posts.map((post) => ({
  id: createId(),
  feedId,
  ...post,
}));

const addFeedDataToState = (url, data) => {
  const feed = createFeed(url, data.feed);
  const posts = createPosts(feed.id, data.posts);

  state.feeds.push(feed);
  state.posts.push(...posts);
};

const markPostAsRead = (postId) => {
  if (!state.ui.readPostsIds.includes(postId)) {
    state.ui.readPostsIds.push(postId);
  }
};

const handlePreview = (postId) => {
  markPostAsRead(postId);
  state.ui.modalPostId = postId;
  modal.show();
};

const handleSuccess = (url, data) => {
  addFeedDataToState(url, data);
  state.form.error = null;
  state.form.processState = 'added';
};

const getErrorKey = (error) => {
  if (error instanceof Error && error.message.startsWith('errors.')) {
    return error.message;
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
    if (state.form.processState === 'invalid' || state.form.processState === 'added') {
      state.form.processState = 'filling';
      state.form.error = null;
    }
  });
};

const watchPosts = () => {
  elements.postsContainer.addEventListener('click', (event) => {
    const previewButton = event.target.closest('.preview-button');
    const postLink = event.target.closest('a[data-id]');

    if (previewButton) {
      const { id } = previewButton.dataset;
      handlePreview(id);
      return;
    }

    if (postLink) {
      const { id } = postLink.dataset;
      markPostAsRead(id);
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
  watchPosts();
  watchForm();
  scheduleUpdates(state);
});
