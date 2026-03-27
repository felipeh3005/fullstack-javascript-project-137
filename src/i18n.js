import i18next from 'i18next';
import resources from './locales.js';

const initI18n = () => i18next.init({
  lng: 'ru',
  debug: false,
  resources,
});

export { i18next };
export default initI18n;
