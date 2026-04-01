(() => {
  const root = document.documentElement;
  const revealEls = document.querySelectorAll('.reveal');
  const parallaxEls = document.querySelectorAll('[data-speed]');
  const tiltEls = document.querySelectorAll('[data-tilt]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  const applyParallax = () => {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = Number(el.getAttribute('data-speed')) || 0.12;
      const shift = y * speed;
      el.style.transform = `translate3d(0, ${shift * -0.28}px, 0)`;
    });
  };

  const handleTilt = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = (event.clientY - cy) / (rect.height / 2);
    const ry = (event.clientX - cx) / (rect.width / 2);

    card.style.transform = `perspective(1000px) rotateX(${(-rx * 7).toFixed(2)}deg) rotateY(${(ry * 9).toFixed(2)}deg) translateY(-2px)`;
  };

  const resetTilt = (event) => {
    event.currentTarget.style.transform = '';
  };

  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', handleTilt);
    el.addEventListener('mouseleave', resetTilt);
  });

  applyParallax();
  window.addEventListener('scroll', applyParallax, { passive: true });

  // Keeps mobile browser address bar shifts from snapping transforms.
  window.addEventListener('resize', () => {
    root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    applyParallax();
  });
})();