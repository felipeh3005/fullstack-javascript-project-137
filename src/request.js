import axios from 'axios';

const buildProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get');

  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);

  return proxyUrl.toString();
};

const fetchFeed = (url) => axios
  .get(buildProxyUrl(url))
  .then((response) => response.data.contents);

export default fetchFeed;
