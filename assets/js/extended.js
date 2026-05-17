document.addEventListener('alpine:init', () => {
  Alpine.data('vzNav', () => ({
    open: false,
    scrolled: false,
    init() {
      window.addEventListener('scroll', () => {
        this.scrolled = window.scrollY > 10;
      }, { passive: true });
    }
  }));
});
