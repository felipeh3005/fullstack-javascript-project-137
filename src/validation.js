import * as yup from 'yup';

const createSchema = (feeds) => yup.string()
  .trim()
  .required('No puede estar vacío')
  .url('El enlace debe ser una URL válida')
  .notOneOf(feeds, 'RSS ya existe');

const validateUrl = (url, feeds) => createSchema(feeds).validate(url);

export default validateUrl;
