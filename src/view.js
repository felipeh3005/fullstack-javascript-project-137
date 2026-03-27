import { subscribe } from 'valtio/vanilla';
import { i18next } from './i18n.js';

const renderForm = (state, elements) => {
  const { input, feedback, form } = elements;
  const { processState, error } = state.form;

  if (processState === 'invalid') {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = i18next.t(error);
    return;
  }

  if (processState === 'added') {
    form.reset();
    input.focus();
    input.classList.remove('is-invalid');
    input.classList.remove('is-valid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18next.t('form.success');
    return;
  }

  if (processState === 'sending') {
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = '';
    return;
  }

  input.classList.remove('is-invalid');
  input.classList.remove('is-valid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = '';
};

const renderFeeds = (state, elements) => {
  const { feedsContainer } = elements;

  if (state.feeds.length === 0) {
    feedsContainer.innerHTML = `
      <h2 class="h5">${i18next.t('sections.feeds')}</h2>
      <p class="text-muted mb-0">No feeds added yet.</p>
    `;
    return;
  }

  const feedsMarkup = state.feeds.map((feed) => `
    <li class="list-group-item border-0 px-0 py-2">
      <h3 class="h6 mb-1">${feed.title}</h3>
      <p class="mb-0 text-muted">${feed.description}</p>
    </li>
  `).join('');

  feedsContainer.innerHTML = `
    <h2 class="h5">${i18next.t('sections.feeds')}</h2>
    <ul class="list-group list-group-flush border-0">
      ${feedsMarkup}
    </ul>
  `;
};

const isReadPost = (state, postId) => state.ui.readPostsIds.includes(postId);

const renderPosts = (state, elements) => {
  const { postsContainer } = elements;

  if (state.posts.length === 0) {
    postsContainer.innerHTML = `
      <h2 class="h5">${i18next.t('sections.posts')}</h2>
      <p class="text-muted mb-0">No posts to display yet.</p>
    `;
    return;
  }

  const postsMarkup = state.posts.map((post) => {
    const titleClass = isReadPost(state, post.id)
    ? 'fw-normal link-secondary'
    : 'fw-bold';

    return `
      <li class="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-start gap-2">
        <a
          href="${post.link}"
          target="_blank"
          rel="noopener noreferrer"
          data-id="${post.id}"
          class="${titleClass}"
        >
          ${post.title}
        </a>
        <button
          type="button"
          class="btn btn-outline-primary btn-sm preview-button flex-shrink-0"
          data-id="${post.id}"
        >
          ${i18next.t('buttons.preview')}
        </button>
      </li>
    `;
  }).join('');

  postsContainer.innerHTML = `
    <h2 class="h5">${i18next.t('sections.posts')}</h2>
    <ul class="list-group list-group-flush border-0">
      ${postsMarkup}
    </ul>
  `;
};

const renderModal = (state, elements) => {
  const { modalTitle, modalDescription, modalLink } = elements;
  const currentPost = state.posts.find((post) => post.id === state.ui.modalPostId);

  if (!currentPost) {
    modalTitle.textContent = '';
    modalDescription.textContent = '';
    modalLink.setAttribute('href', '#');
    return;
  }

  modalTitle.textContent = currentPost.title;
  modalDescription.textContent = currentPost.description || i18next.t('modal.fallbackDescription');
  modalLink.setAttribute('href', currentPost.link);
};

const render = (state, elements) => {
  renderForm(state, elements);
  renderFeeds(state, elements);
  renderPosts(state, elements);
  renderModal(state, elements);
};

const initView = (state, elements) => {
  render(state, elements);

  subscribe(state, () => {
    render(state, elements);
  });
};

export default initView;
