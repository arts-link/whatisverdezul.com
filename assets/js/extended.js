document.addEventListener('alpine:init', () => {
  Alpine.data('vzNav', () => ({
    open: false
  }));

  Alpine.data('vzLightbox', () => ({
    activeVideo: null,
    open(id) {
      this.activeVideo = id;
      this.$refs.frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
    },
    close() {
      this.activeVideo = null;
      this.$refs.frame.src = '';
    },
  }));
});
