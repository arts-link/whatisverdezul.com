document.addEventListener('alpine:init', () => {
  Alpine.data('vzNav', () => ({
    open: false
  }));

  // Contact form — POSTs to Formspree via fetch. Registered as a component
  // (rather than an inline @submit expression) because the CSP-safe Alpine
  // build cannot evaluate fetch()/promise chains in inline expressions.
  // Requires https://formspree.io in the CSP connect-src (set in hugo.toml).
  Alpine.data('contactForm', () => ({
    name: '',
    email: '',
    message: '',
    subject: 'General',
    gotcha: '',
    status: '',
    submit() {
      this.status = 'loading';
      fetch('https://formspree.io/f/xojgerbg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          message: this.message,
          subject: this.subject,
          _subject: '[' + this.subject + '] Message from ' + this.name + ' via whatisverdezul.com',
          _gotcha: this.gotcha,
        }),
      })
        .then((r) => {
          this.status = r.ok ? 'success' : 'error';
          if (r.ok && window.posthog) window.posthog.capture('contact_form_submit');
        })
        .catch(() => { this.status = 'error'; });
    },
  }));

  // "Stay in the loop" email signup — POSTs to Formspree. Same CSP-driven
  // component pattern as contactForm. Requires https://formspree.io in the
  // CSP connect-src (set in hugo.toml).
  Alpine.data('subscribeForm', () => ({
    email: '',
    gotcha: '',
    status: '',
    submit() {
      this.status = 'loading';
      if (window.posthog) window.posthog.capture('email_signup_submit');
      fetch('https://formspree.io/f/mlgqjvro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          _subject: 'New Verdèzul mailing list signup',
          _gotcha: this.gotcha,
        }),
      })
        .then((r) => {
          this.status = r.ok ? 'success' : 'error';
          if (r.ok && window.posthog) window.posthog.capture('email_signup_success');
        })
        .catch(() => { this.status = 'error'; });
    },
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
