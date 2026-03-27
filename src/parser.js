const parseError = () => {
  throw new Error('errors.parse')
}

const getRequiredElement = (parent, selector) => {
  const element = parent.querySelector(selector)

  if (!element) {
    parseError()
  }

  return element
}

const parseFeed = document => {
  const channel = getRequiredElement(document, 'channel')

  return {
    title: getRequiredElement(channel, 'title').textContent,
    description: getRequiredElement(channel, 'description').textContent,
  }
}

const parsePosts = document => {
  const items = document.querySelectorAll('item')

  return Array.from(items).map(item => ({
    title: getRequiredElement(item, 'title').textContent,
    link: getRequiredElement(item, 'link').textContent,
    description: getRequiredElement(item, 'description').textContent,
  }))
}

const parseRss = contents => {
  const parser = new DOMParser()
  const document = parser.parseFromString(contents, 'application/xml')
  const parsingError = document.querySelector('parsererror')

  if (parsingError) {
    parseError()
  }

  return {
    feed: parseFeed(document),
    posts: parsePosts(document),
  }
}

export default parseRss
