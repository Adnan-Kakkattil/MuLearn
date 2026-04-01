(() => {
  const revealEls = document.querySelectorAll('.reveal');
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax], .parallax[data-speed]')).map((el) => ({
    el,
    baseTransform: getComputedStyle(el).transform,
  }));
  const tiltEls = document.querySelectorAll('.tilt, [data-tilt]');
  const counters = document.querySelectorAll('[data-count], [data-counter]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-count') || el.getAttribute('data-counter')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      el.textContent = `${value.toLocaleString()}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = '1';
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => statObserver.observe(counter));
  counters.forEach((counter) => {
    const current = counter.textContent || '';
    const suffix = current.includes('%') ? '%' : current.includes('+') ? '+' : '';
    if (suffix) {
      counter.setAttribute('data-suffix', suffix);
    }
  });

  const applyParallax = () => {
    const y = window.scrollY;
    parallaxEls.forEach(({ el, baseTransform }) => {
      if (el.matches('.tilt, [data-tilt]')) {
        return;
      }

      const speed = Number(el.getAttribute('data-parallax') || el.getAttribute('data-speed')) || 0.1;
      const shift = -y * speed * 0.22;
      const parsedBase = baseTransform && baseTransform !== 'none' ? baseTransform : '';
      el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) ${parsedBase}`.trim();
    });
  };

  const tiltOn = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-3px)`;
  };

  const tiltOff = (event) => {
    event.currentTarget.style.transform = '';
  };

  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', tiltOn);
    el.addEventListener('mouseleave', tiltOff);
  });

  applyParallax();
  window.addEventListener('scroll', applyParallax, { passive: true });
  window.addEventListener('resize', applyParallax);
})();
