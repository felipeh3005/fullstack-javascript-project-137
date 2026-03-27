import axios from 'axios'

const fetchFeed = (url) => axios
  .get('https://allorigins.hexlet.app/get', {
    params: {
      disableCache: true,
      url,
    },
  })
  .then(({ data }) => data.contents)

export default fetchFeed
