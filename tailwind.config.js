const themeConfig = require('./themes/ryder/tailwind.config.js');

module.exports = {
  ...themeConfig,
  content: [
    './themes/ryder/layouts/**/*.html',
    './themes/ryder/exampleSite/hugo_stats.json',
    './layouts/**/*.html',
    './content/**/*.md',
    './hugo_stats.json',
  ],
};
