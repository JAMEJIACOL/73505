// 73505 Scrollytelling Interactive Experience

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  const scrollContainer = document.getElementById('scroll-container');
  const storySteps = document.querySelectorAll('.story-step');

  const frameCount = 96;
  const currentFramePath = index => `frames/frame_${index.toString().padStart(4, '0')}.jpg`;

  const images = [];
  let loadedImages = 0;
  let currentFrameIndex = 0;
  let targetFrameIndex = 0;
  let isRendering = false;

  // Set Canvas Resolution (supporting Retina displays)
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    renderFrame(Math.round(currentFrameIndex));
  }

  // Draw Frame with Object-Fit: Cover
  function renderFrame(index) {
    const img = images[index];
    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = cw;
      drawHeight = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - drawHeight) / 2;
    } else {
      drawHeight = ch;
      drawWidth = ch * imgRatio;
      offsetX = (cw - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Animation Loop with smooth lerp
  function updateAnimation() {
    const diff = targetFrameIndex - currentFrameIndex;
    if (Math.abs(diff) > 0.01) {
      currentFrameIndex += diff * 0.18; // smooth easing
      renderFrame(Math.round(currentFrameIndex));
    }
    requestAnimationFrame(updateAnimation);
  }

  // Scroll Handler
  function onScroll() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / (maxScroll || 1)));

    targetFrameIndex = Math.min(frameCount - 1, Math.max(0, scrollFraction * (frameCount - 1)));
  }

  // Preload Images
  function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFramePath(i);

      img.onload = () => {
        loadedImages++;
        const percent = Math.round((loadedImages / frameCount) * 100);
        loaderBar.style.width = `${percent}%`;
        loaderText.textContent = `Cargando experiencia ${percent}%`;

        // Render first frame as soon as it's ready
        if (loadedImages === 1) {
          resizeCanvas();
        }

        // Hide preloader when enough frames or all frames are ready
        if (loadedImages === frameCount) {
          setTimeout(() => {
            loader.classList.add('hidden');
          }, 350);
        }
      };

      img.onerror = () => {
        loadedImages++;
        if (loadedImages === frameCount) {
          loader.classList.add('hidden');
        }
      };

      images.push(img);
    }
  }

  // Intersection Observer for Step Text Cards
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.4
  });

  storySteps.forEach(step => stepObserver.observe(step));

  // Size Selector & WhatsApp Order Link Updater
  const sizeBtns = document.querySelectorAll('.size-btn');
  const whatsappBtn = document.getElementById('whatsapp-order-btn');
  let selectedSize = 'M';

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.textContent.trim();

      const message = `Hola! Quiero ordenar la Camiseta 73505 Dejó las 99 en Talla ${selectedSize}`;
      whatsappBtn.href = `https://wa.me/573000000000?text=${encodeURIComponent(message)}`;
    });
  });

  // Event Listeners
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Init
  preloadImages();
  resizeCanvas();
  updateAnimation();
});
