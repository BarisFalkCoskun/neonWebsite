<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;
  let animationId;
  let mounted = $state(false);
  let mouse = $state({ x: -1000, y: -1000 });
  let trails = [];
  let time = 0;
  let revealed = $state(false);
  let clickCount = $state(0);

  const LETTERS = [
    { char: 'C', paths: [[0.15, 0.3], [0.05, 0.35], [0, 0.5], [0.05, 0.65], [0.15, 0.7]] },
    { char: 'O', paths: [[0.1, 0.3], [0, 0.5], [0.1, 0.7], [0.2, 0.5], [0.1, 0.3]] },
    { char: 'S', paths: [[0.15, 0.3], [0.05, 0.35], [0.05, 0.45], [0.15, 0.5], [0.15, 0.6], [0.05, 0.7]] },
    { char: 'K', paths: [[0, 0.3], [0, 0.7], [0, 0.5], [0.15, 0.3], [0, 0.5], [0.15, 0.7]] },
    { char: 'U', paths: [[0, 0.3], [0, 0.6], [0.1, 0.7], [0.2, 0.6], [0.2, 0.3]] },
    { char: 'N', paths: [[0, 0.7], [0, 0.3], [0.2, 0.7], [0.2, 0.3]] }
  ];

  function init() {
    ctx = canvas.getContext('2d');
  }

  function drawHiddenText(revealX, revealY, radius) {
    const w = canvas.width;
    const h = canvas.height;

    // Calculate text dimensions
    const fontSize = Math.min(w * 0.15, h * 0.4);
    ctx.font = `bold ${fontSize}px "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = 'COSKUN';
    const textWidth = ctx.measureText(text).width;
    const centerX = w / 2;
    const centerY = h / 2;

    // Create the reveal mask
    ctx.save();

    // Draw all trails as reveal areas
    ctx.beginPath();

    // Current mouse position with large radius
    if (revealX > 0 && revealY > 0) {
      ctx.arc(revealX, revealY, radius, 0, Math.PI * 2);
    }

    // Trail circles (fading)
    trails.forEach((t, i) => {
      const age = 1 - (time - t.time) / 3;
      if (age > 0) {
        ctx.moveTo(t.x + t.radius * age, t.y);
        ctx.arc(t.x, t.y, t.radius * age, 0, Math.PI * 2);
      }
    });

    ctx.clip();

    // Draw the text inside the clipped area
    // Smooth animated gradient using sine waves for seamless color flow
    const gradient = ctx.createLinearGradient(
      centerX - textWidth/2 + Math.sin(time * 0.5) * 30,
      centerY,
      centerX + textWidth/2 + Math.sin(time * 0.5 + 2) * 30,
      centerY
    );

    // Smooth color cycling using sine waves (no harsh modulo wrapping)
    const t = time * 0.3;
    const c1 = `hsl(${(Math.sin(t) * 30 + 0)}, 85%, 65%)`;
    const c2 = `hsl(${(Math.sin(t + 0.5) * 30 + 45)}, 90%, 65%)`;
    const c3 = `hsl(${(Math.sin(t + 1) * 30 + 190)}, 85%, 65%)`;
    const c4 = `hsl(${(Math.sin(t + 1.5) * 30 + 300)}, 80%, 70%)`;
    const c5 = `hsl(${(Math.sin(t + 2) * 30 + 220)}, 85%, 65%)`;
    const c6 = `hsl(${(Math.sin(t + 2.5) * 30 + 270)}, 80%, 55%)`;

    gradient.addColorStop(0, c1);
    gradient.addColorStop(0.2, c2);
    gradient.addColorStop(0.4, c3);
    gradient.addColorStop(0.6, c4);
    gradient.addColorStop(0.8, c5);
    gradient.addColorStop(1, c6);

    // Smooth pulsing glow
    const glowHue = Math.sin(t) * 30 + 200;
    ctx.shadowColor = `hsl(${glowHue}, 80%, 70%)`;
    ctx.shadowBlur = 25 + Math.sin(time * 1.5) * 8;
    ctx.fillStyle = gradient;
    ctx.fillText(text, centerX, centerY);

    // Sharper overlay
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(text, centerX, centerY);

    ctx.restore();

    // Draw flashlight edge glow
    if (revealX > 0 && revealY > 0 && !revealed) {
      const edgeGradient = ctx.createRadialGradient(revealX, revealY, radius * 0.8, revealX, revealY, radius * 1.2);
      edgeGradient.addColorStop(0, 'transparent');
      edgeGradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
      edgeGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = edgeGradient;
      ctx.beginPath();
      ctx.arc(revealX, revealY, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function render() {
    time += 0.016;

    const w = canvas.width;
    const h = canvas.height;

    // Pure black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Clean old trails
    trails = trails.filter(t => (time - t.time) < 3);

    // Reveal radius - starts small, grows with interaction
    const baseRadius = Math.min(w, h) * 0.12;
    const dynamicRadius = baseRadius + Math.min(clickCount * 10, baseRadius);

    // Draw hidden text with reveal effect
    if (revealed) {
      // Full reveal with animation
      const fontSize = Math.min(w * 0.15, h * 0.4);
      ctx.font = `bold ${fontSize}px "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = 'COSKUN';
      const textWidth = ctx.measureText(text).width;
      const centerX = w / 2;
      const centerY = h / 2;

      // Smooth animated gradient for revealed state
      const gradient = ctx.createLinearGradient(
        centerX - textWidth/2 + Math.sin(time * 0.5) * 30,
        centerY,
        centerX + textWidth/2 + Math.sin(time * 0.5 + 2) * 30,
        centerY
      );

      const t = time * 0.3;
      const c1 = `hsl(${(Math.sin(t) * 30 + 0)}, 85%, 65%)`;
      const c2 = `hsl(${(Math.sin(t + 0.5) * 30 + 45)}, 90%, 65%)`;
      const c3 = `hsl(${(Math.sin(t + 1) * 30 + 190)}, 85%, 65%)`;
      const c4 = `hsl(${(Math.sin(t + 1.5) * 30 + 300)}, 80%, 70%)`;
      const c5 = `hsl(${(Math.sin(t + 2) * 30 + 220)}, 85%, 65%)`;
      const c6 = `hsl(${(Math.sin(t + 2.5) * 30 + 270)}, 80%, 55%)`;

      gradient.addColorStop(0, c1);
      gradient.addColorStop(0.2, c2);
      gradient.addColorStop(0.4, c3);
      gradient.addColorStop(0.6, c4);
      gradient.addColorStop(0.8, c5);
      gradient.addColorStop(1, c6);

      // Smooth pulsing glow
      const glowHue = Math.sin(t) * 30 + 200;
      ctx.shadowColor = `hsl(${glowHue}, 80%, 70%)`;
      ctx.shadowBlur = 40 + Math.sin(time * 1.5) * 15;
      ctx.fillStyle = gradient;
      ctx.fillText(text, centerX, centerY);

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(text, centerX, centerY);
    } else {
      drawHiddenText(mouse.x, mouse.y, dynamicRadius);
    }

    // Hint text
    if (!revealed && trails.length < 5 && time > 2) {
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(time * 2) * 0.1})`;
      ctx.fillText('move cursor to reveal', w / 2, h - 50);
    }

    // Click hint after some exploration
    if (!revealed && clickCount < 5 && trails.length > 20) {
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(time * 3) * 0.1})`;
      ctx.fillText('click to expand light', w / 2, h - 50);
    }

    animationId = requestAnimationFrame(render);
  }

  function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx?.scale(dpr, dpr);
  }

  function handleMouseMove(e) {
    const x = e.clientX * (window.devicePixelRatio || 1);
    const y = e.clientY * (window.devicePixelRatio || 1);

    mouse = { x, y };

    // Add to trail
    trails.push({
      x, y,
      radius: Math.min(canvas.width, canvas.height) * 0.08,
      time
    });
  }

  function handleClick() {
    clickCount++;

    // Add burst of trails
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = Math.min(canvas.width, canvas.height) * 0.1;
      trails.push({
        x: mouse.x + Math.cos(angle) * dist,
        y: mouse.y + Math.sin(angle) * dist,
        radius: Math.min(canvas.width, canvas.height) * 0.1,
        time
      });
    }

    // After enough clicks, full reveal
    if (clickCount >= 10) {
      revealed = true;
    }
  }

  function handleDoubleClick() {
    revealed = true;
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.clientX * (window.devicePixelRatio || 1);
    const y = touch.clientY * (window.devicePixelRatio || 1);

    mouse = { x, y };
    trails.push({
      x, y,
      radius: Math.min(canvas.width, canvas.height) * 0.08,
      time
    });
  }

  function handleTouchStart(e) {
    handleTouchMove(e);
    handleClick();
  }

  onMount(() => {
    handleResize();
    init();

    setTimeout(() => {
      mounted = true;
      render();
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<svelte:head>
  <title>COSKUN</title>
</svelte:head>

<div class="void" class:mounted>
  <canvas
    bind:this={canvas}
    onmousemove={handleMouseMove}
    onclick={handleClick}
    ondblclick={handleDoubleClick}
    ontouchmove={handleTouchMove}
    ontouchstart={handleTouchStart}
  ></canvas>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    cursor: none;
  }

  :global(html, body) {
    height: 100%;
    overflow: hidden;
    background: #000;
  }

  .void {
    position: fixed;
    inset: 0;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .void.mounted {
    opacity: 1;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
