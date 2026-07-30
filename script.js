(function () {
  'use strict';

  // Instant Background JS Preloader for Zero-Lag Image Rendering on Netlify / CDN
  const imagesToPreload = [
    'assets/avatars/valeriy.jpg',
    'assets/avatars/yaroslav.png',
    'assets/projects/nuclear_it_hack.jpg',
    'assets/projects/lsad-hse.jpg',
    'assets/projects/rosatom.jpg',
    'assets/projects/vsu-abitur.jpg',
    'assets/projects/vsu-liter.jpg',
    'assets/projects/mpit.png',
    'assets/projects/vrn-ctf.jpg',
    'assets/projects/ctf-vsu.png',
    'assets/projects/wata.jpg'
  ];

  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  const container = document.getElementById('slides-container');
  const slides = document.querySelectorAll('.slide-section');
  const navLinks = document.querySelectorAll('.header-nav .nav-link');

  if (container && slides.length > 0) {
    const observerOptions = {
      root: container,
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const isProjectGroup = entry.target.getAttribute('data-slide-group') === 'projects';
          
          entry.target.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));

          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const targetId = href.substring(1);
            
            if (targetId === id || (isProjectGroup && link.getAttribute('data-nav-target') === 'projects')) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    slides.forEach(slide => observer.observe(slide));
  }

  let isNavigating = false;

  function scrollToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    isNavigating = true;
    slides[index].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { isNavigating = false; }, 850);
  }

  window.addEventListener('keydown', (e) => {
    if (isNavigating) return;
    const currentIndex = Array.from(slides).findIndex(s => {
      const rect = s.getBoundingClientRect();
      return Math.abs(rect.top) < window.innerHeight / 2;
    });

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSlide(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSlide(currentIndex - 1);
    }
  });

  const toggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        toggle.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        const targetId = link.getAttribute('href');
        if (targetId) {
          const targetElem = document.querySelector(targetId);
          if (targetElem) targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetElem = document.querySelector(href);
        if (targetElem) targetElem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 48;
    let globalAngle = 0;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.alpha = Math.random() * 0.4 + 0.15;
        this.baseAlpha = this.alpha;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        this.pulse += 0.015;
        this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.15;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(193, 242, 41, ${Math.max(0, this.alpha)})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }

    window.addEventListener('resize', resizeCanvas);
    initParticles();

    function animate() {
      ctx.clearRect(0, 0, width, height);

      globalAngle += 0.0008;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(globalAngle * 0.1);
      ctx.translate(-width / 2, -height / 2);

      const linkDist = 135;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(193, 242, 41, ${(1 - dist / linkDist) * 0.1})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();

            for (let k = j + 1; k < particles.length; k++) {
              const dx2 = particles[j].x - particles[k].x;
              const dy2 = particles[j].y - particles[k].y;
              const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

              if (dist2 < linkDist * 0.85) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.lineTo(particles[k].x, particles[k].y);
                ctx.closePath();
                ctx.fillStyle = `rgba(193, 242, 41, ${(1 - dist / linkDist) * 0.025})`;
                ctx.fill();
              }
            }
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      ctx.restore();

      requestAnimationFrame(animate);
    }

    animate();
  }

})();
