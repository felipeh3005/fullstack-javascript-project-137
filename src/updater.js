import fetchFeed from './request.js';
import parseRss from './parser.js';
import createId from './utils.js';

const createNewPosts = (currentPosts, posts, feedId) => {
  const existingLinks = currentPosts.map((post) => post.link);

  return posts
    .filter((post) => !existingLinks.includes(post.link))
    .map((post) => ({
      id: createId(),
      feedId,
      ...post,
    }));
};

const fetchNewPosts = (feed, currentPosts) => fetchFeed(feed.url)
  .then(parseRss)
  .then((data) => createNewPosts(currentPosts, data.posts, feed.id));

const scheduleUpdates = (state) => {
  const run = () => Promise.all(
    state.feeds.map((feed) => fetchNewPosts(feed, state.posts)
      .then((posts) => {
        if (posts.length > 0) {
          state.posts.unshift(...posts);
        }
      })
      .catch(() => null)),
  ).finally(() => {
    setTimeout(run, 5000);
  });

  run();
};

export default scheduleUpdates;
