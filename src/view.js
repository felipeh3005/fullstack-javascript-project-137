import { subscribe } from 'valtio/vanilla';

const renderForm = (state, elements) => {
  const { input, feedback, form } = elements;
  const { processState, error } = state.form;

  if (processState === 'invalid') {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = error;
    return;
  }

  if (processState === 'added') {
    form.reset();
    input.focus();
    input.classList.remove('is-invalid');
    input.classList.remove('is-valid');
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

const initView = (state, elements) => {
  renderForm(state, elements);

  subscribe(state, () => {
    renderForm(state, elements);
  });
};

export default initView;
