(() => {
  const revealEls = document.querySelectorAll('.reveal');
  const tiltEls = document.querySelectorAll('[data-tilt]');
  const parallaxEls = document.querySelectorAll('.parallax[data-speed]');
  const form = document.querySelector('form');
  const note = document.getElementById('form-note');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => io.observe(el));

  const tiltOn = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  };

  const tiltOff = (event) => {
    event.currentTarget.style.transform = '';
  };

  tiltEls.forEach((card) => {
    card.addEventListener('mousemove', tiltOn);
    card.addEventListener('mouseleave', tiltOff);
  });

  const parallax = () => {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = Number(el.getAttribute('data-speed')) || 0.1;
      el.style.setProperty('--parallax', `${-y * speed * 0.22}px`);
    });
  };

  parallax();
  window.addEventListener('scroll', parallax, { passive: true });
  window.addEventListener('resize', parallax);

  if (form && note) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      note.textContent = 'Thanks! Your message is queued with the MuLearn team.';
      form.reset();
    });
  }
})();
