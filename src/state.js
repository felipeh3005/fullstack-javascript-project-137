import { proxy } from 'valtio/vanilla';

const state = proxy({
  form: {
    processState: 'filling',
    error: null,
  },
  feeds: [],
});

export default state;
