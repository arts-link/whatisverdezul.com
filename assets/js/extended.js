document.addEventListener('alpine:init', () => {
  Alpine.data('vzNav', () => ({
    open: false
  }));

  Alpine.data('vzLightbox', () => ({
    activeVideo: null,
    openVideo(event) {
      const { videoId, videoTitle } = event.currentTarget.dataset;
      this.open(videoId, videoTitle);
    },
    open(id, title = '') {
      if (window.posthog) {
        window.posthog.capture('youtube_play_click', {
          video_id: id,
          video_title: title,
        });
      }
      this.activeVideo = id;
      this.$refs.frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
    },
    close() {
      this.activeVideo = null;
      this.$refs.frame.src = '';
    },
  }));
});
