import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required: 'errors.required',
    notOneOf: 'errors.duplicate',
  },
  string: {
    url: 'errors.invalidUrl',
  },
})

const createSchema = feeds => yup.string()
  .trim()
  .required()
  .url()
  .notOneOf(feeds)

const validateUrl = (url, feeds) => createSchema(feeds).validate(url)

export default validateUrl
