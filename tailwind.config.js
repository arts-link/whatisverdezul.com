module.exports = {
  presets: [require('./themes/ryder/tailwind.preset.js')],
  content: [
    './themes/ryder/layouts/**/*.html',
    './layouts/**/*.html',
    './content/**/*.md',
    './hugo_stats.json',
  ],
};
