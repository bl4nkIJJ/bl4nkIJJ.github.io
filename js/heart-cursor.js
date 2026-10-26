(() => {
  "use strict";
  const canvas = document.getElementById("heart-cursor");
  if (!canvas) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const touchLike = window.matchMedia("(pointer: coarse)");
  const particles = [];
  const maxParticles = 95;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let lastSpawn = 0;
  let frameId = 0;
  let pointer = { x: 0, y: 0 };

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function addHeart(x, y) {
    if (particles.length >= maxParticles) particles.splice(0, 8);
    const size = 5 + Math.random() * 7;
    particles.push({
      x: x + (Math.random() - .5) * 5,
      y: y + (Math.random() - .5) * 5,
      vx: (Math.random() - .5) * .8,
      vy: -.55 - Math.random() * 1.05,
      size,
      life: 0,
      maxLife: 34 + Math.random() * 24,
      rotation: (Math.random() - .5) * .8,
      spin: (Math.random() - .5) * .025,
      alpha: .72 + Math.random() * .25,
      color: ["#f28bb7", "#f7a6bf", "#e98da9", "#f3b7ca"][Math.floor(Math.random() * 4)]
    });
  }

  function heartPath(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, size * .32);
    ctx.bezierCurveTo(-size * .9, -size * .35, -size * .45, -size * .9, 0, -size * .48);
    ctx.bezierCurveTo(size * .45, -size * .9, size * .9, -size * .35, 0, size * .32);
    ctx.closePath();
  }

  function onPointerMove(event) {
    const now = performance.now();
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = { x: event.clientX, y: event.clientY };
    if (now - lastSpawn < 24 || Math.abs(dx) + Math.abs(dy) < 2) return;
    lastSpawn = now;
    addHeart(pointer.x, pointer.y);
    if (Math.abs(dx) + Math.abs(dy) > 42) addHeart(pointer.x - dx * .22, pointer.y - dy * .22);
  }

  function onTouch(event) {
    const touch = event.touches && event.touches[0];
    if (touch) {
      addHeart(touch.clientX, touch.clientY);
      addHeart(touch.clientX + 9, touch.clientY + 4);
    }
  }

  function render() {
    context.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx += (Math.random() - .5) * .045;
      p.vy -= .006;
      p.rotation += p.spin;
      const t = 1 - p.life / p.maxLife;
      if (t <= 0) {
        particles.splice(i, 1);
        continue;
      }
      context.save();
      context.translate(p.x, p.y);
      context.rotate(p.rotation);
      context.globalAlpha = p.alpha * Math.min(1, t * 2.2);
      context.fillStyle = p.color;
      heartPath(context, p.size * (.72 + (1 - t) * .28));
      context.fill();
      context.restore();
    }
    frameId = window.requestAnimationFrame(render);
  }

  function start() {
    if (motionQuery.matches) return;
    resize();
    window.addEventListener("resize", resize, { passive: true });
    if (!touchLike.matches) window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    render();
  }

  function stop() {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("touchstart", onTouch);
    window.removeEventListener("touchmove", onTouch);
    particles.length = 0;
    context.clearRect(0, 0, width, height);
  }

  motionQuery.addEventListener?.("change", () => {
    stop();
    if (!motionQuery.matches) start();
  });
  start();
})();
