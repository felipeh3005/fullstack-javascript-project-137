import { proxy } from 'valtio/vanilla';

const state = proxy({
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
});

export default state;
