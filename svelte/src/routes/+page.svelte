<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;
  let animationId;
  let mounted = $state(false);
  let mouse = $state({ x: -1000, y: -1000 });
  let time = 0;

  // Discovery state
  let discoveredStars = new Set();
  let constellationProgress = $state(0);
  let totalStars = 0;
  let fullyRevealed = $state(false);

  // Cosmic elements
  let stars = [];
  let constellationStars = [];
  let constellationLines = [];
  let nebulae = [];
  let shootingStars = [];
  let particles = [];

  // Letter constellation definitions - points that form each letter
  const letterConstellations = {
    C: [
      { x: 0.35, y: 0.25 }, { x: 0.2, y: 0.3 }, { x: 0.1, y: 0.4 },
      { x: 0.08, y: 0.5 }, { x: 0.1, y: 0.6 }, { x: 0.2, y: 0.7 }, { x: 0.35, y: 0.75 }
    ],
    O: [
      { x: 0.5, y: 0.25 }, { x: 0.35, y: 0.35 }, { x: 0.3, y: 0.5 },
      { x: 0.35, y: 0.65 }, { x: 0.5, y: 0.75 }, { x: 0.65, y: 0.65 },
      { x: 0.7, y: 0.5 }, { x: 0.65, y: 0.35 }
    ],
    S: [
      { x: 0.65, y: 0.28 }, { x: 0.45, y: 0.25 }, { x: 0.3, y: 0.32 },
      { x: 0.35, y: 0.45 }, { x: 0.55, y: 0.5 }, { x: 0.65, y: 0.58 },
      { x: 0.6, y: 0.72 }, { x: 0.4, y: 0.75 }, { x: 0.25, y: 0.7 }
    ],
    K: [
      { x: 0.25, y: 0.25 }, { x: 0.25, y: 0.4 }, { x: 0.25, y: 0.55 },
      { x: 0.25, y: 0.75 }, { x: 0.25, y: 0.5 }, { x: 0.45, y: 0.25 },
      { x: 0.25, y: 0.5 }, { x: 0.5, y: 0.75 }
    ],
    U: [
      { x: 0.2, y: 0.25 }, { x: 0.2, y: 0.45 }, { x: 0.2, y: 0.6 },
      { x: 0.3, y: 0.73 }, { x: 0.5, y: 0.75 }, { x: 0.6, y: 0.65 },
      { x: 0.65, y: 0.5 }, { x: 0.65, y: 0.25 }
    ],
    N: [
      { x: 0.2, y: 0.75 }, { x: 0.2, y: 0.5 }, { x: 0.2, y: 0.25 },
      { x: 0.4, y: 0.5 }, { x: 0.6, y: 0.75 }, { x: 0.6, y: 0.5 }, { x: 0.6, y: 0.25 }
    ]
  };

  function init() {
    ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Create background stars (decorative, always slightly visible)
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.15 + 0.05,
        twinkleSpeed: Math.random() * 2 + 1,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Create constellation stars from letter definitions
    const letters = ['C', 'O', 'S', 'K', 'U', 'N'];
    const letterWidth = w / 8;
    const startX = w / 2 - (letters.length * letterWidth) / 2;
    const letterHeight = h * 0.5;
    const centerY = h / 2;

    let starId = 0;
    letters.forEach((letter, li) => {
      const points = letterConstellations[letter];
      const baseX = startX + li * letterWidth;
      const prevStars = [];

      points.forEach((p, pi) => {
        const x = baseX + p.x * letterWidth;
        const y = centerY - letterHeight / 2 + p.y * letterHeight;

        const star = {
          id: starId++,
          x,
          y,
          baseX: x,
          baseY: y,
          size: 3 + Math.random() * 2,
          discovered: false,
          brightness: 0,
          targetBrightness: 0,
          color: `hsl(${200 + Math.random() * 60}, 80%, 70%)`,
          twinklePhase: Math.random() * Math.PI * 2,
          letter: li,
          index: pi
        };

        constellationStars.push(star);

        // Create constellation lines connecting sequential stars
        if (prevStars.length > 0) {
          const prevStar = prevStars[prevStars.length - 1];
          constellationLines.push({
            from: prevStar,
            to: star,
            discovered: false,
            brightness: 0
          });
        }
        prevStars.push(star);
      });
    });

    totalStars = constellationStars.length;

    // Create nebulae (hidden until discovered)
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 100 + Math.random() * 200,
        hue: Math.random() * 60 + 200,
        discovered: false,
        brightness: 0,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnShootingStar() {
    if (Math.random() < 0.005 && shootingStars.length < 3) {
      const w = canvas.width;
      const h = canvas.height;
      shootingStars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.3,
        vx: (Math.random() - 0.3) * 15,
        vy: Math.random() * 8 + 4,
        life: 1,
        length: 50 + Math.random() * 100
      });
    }
  }

  function drawNebula(nebula) {
    if (nebula.brightness < 0.01) return;

    ctx.save();
    ctx.translate(nebula.x, nebula.y);
    ctx.rotate(nebula.rotation + time * 0.02);

    const layers = 4;
    for (let i = layers; i >= 0; i--) {
      const size = nebula.size * (1 - i * 0.15);
      const alpha = nebula.brightness * 0.15 * (1 - i / layers);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, `hsla(${nebula.hue + i * 20}, 70%, 50%, ${alpha})`);
      gradient.addColorStop(0.4, `hsla(${nebula.hue + i * 10}, 60%, 40%, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.6, i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawStar(star, isConstellation = false) {
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
    const brightness = isConstellation ? star.brightness : star.brightness * twinkle;

    if (brightness < 0.01) return;

    // Glow
    const glowSize = star.size * (isConstellation ? 8 : 4);
    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);

    if (isConstellation && star.discovered) {
      glow.addColorStop(0, `hsla(45, 100%, 90%, ${brightness * 0.8})`);
      glow.addColorStop(0.2, `hsla(45, 90%, 70%, ${brightness * 0.4})`);
      glow.addColorStop(0.5, `hsla(35, 80%, 50%, ${brightness * 0.1})`);
      glow.addColorStop(1, 'transparent');
    } else {
      glow.addColorStop(0, `rgba(200, 220, 255, ${brightness * 0.6})`);
      glow.addColorStop(0.5, `rgba(150, 180, 255, ${brightness * 0.2})`);
      glow.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = isConstellation && star.discovered
      ? `rgba(255, 250, 230, ${brightness})`
      : `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * brightness, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle rays for bright constellation stars
    if (isConstellation && star.brightness > 0.7) {
      ctx.strokeStyle = `rgba(255, 250, 220, ${(star.brightness - 0.7) * 0.5})`;
      ctx.lineWidth = 1;
      const rayLength = star.size * 4;
      for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2 + time * 0.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x + Math.cos(angle) * rayLength,
          star.y + Math.sin(angle) * rayLength
        );
        ctx.stroke();
      }
    }
  }

  function drawConstellationLine(line) {
    if (line.brightness < 0.01) return;

    const from = line.from;
    const to = line.to;

    ctx.strokeStyle = `rgba(255, 220, 150, ${line.brightness * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -time * 20;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  function drawShootingStar(star) {
    const gradient = ctx.createLinearGradient(
      star.x, star.y,
      star.x - star.vx * star.length / 15,
      star.y - star.vy * star.length / 15
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
    gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.life * 0.5})`);
    gradient.addColorStop(1, 'transparent');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
      star.x - star.vx * star.length / 15,
      star.y - star.vy * star.length / 15
    );
    ctx.stroke();

    // Bright head
    ctx.fillStyle = `rgba(255, 255, 255, ${star.life})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 2 + 1,
        color
      });
    }
  }

  function render() {
    time += 0.016;

    const w = canvas.width;
    const h = canvas.height;

    // Deep space background
    const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
    bgGrad.addColorStop(0, '#0a0a12');
    bgGrad.addColorStop(0.5, '#050508');
    bgGrad.addColorStop(1, '#000002');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Calculate reveal radius based on mouse
    const revealRadius = fullyRevealed ? Math.max(w, h) * 2 : Math.min(w, h) * 0.2;
    const mouseX = mouse.x;
    const mouseY = mouse.y;

    // Update and draw nebulae
    nebulae.forEach(nebula => {
      const dist = Math.sqrt((nebula.x - mouseX) ** 2 + (nebula.y - mouseY) ** 2);
      const inRange = dist < revealRadius + nebula.size;

      if (inRange || fullyRevealed) {
        nebula.discovered = true;
        nebula.brightness = Math.min(nebula.brightness + 0.02, 0.8);
      } else {
        nebula.brightness = Math.max(nebula.brightness - 0.01, 0);
      }

      drawNebula(nebula);
    });

    // Draw background stars (always slightly visible, brighter when revealed)
    stars.forEach(star => {
      const dist = Math.sqrt((star.x - mouseX) ** 2 + (star.y - mouseY) ** 2);
      const inRange = dist < revealRadius;

      if (inRange || fullyRevealed) {
        star.brightness = Math.min(star.brightness + 0.05, 0.6 + Math.random() * 0.4);
      } else {
        star.brightness = Math.max(star.brightness - 0.02, star.brightness * 0.1 + 0.03);
      }

      drawStar(star);
    });

    // Update and draw constellation stars
    let newlyDiscovered = 0;
    constellationStars.forEach(star => {
      const dist = Math.sqrt((star.x - mouseX) ** 2 + (star.y - mouseY) ** 2);
      const inRange = dist < revealRadius * 0.8;

      // Gentle floating motion
      star.x = star.baseX + Math.sin(time * 0.5 + star.twinklePhase) * 3;
      star.y = star.baseY + Math.cos(time * 0.3 + star.twinklePhase) * 3;

      if ((inRange || fullyRevealed) && !star.discovered) {
        star.discovered = true;
        discoveredStars.add(star.id);
        newlyDiscovered++;
        spawnParticles(star.x, star.y, 10, 'gold');
      }

      if (star.discovered) {
        star.brightness = Math.min(star.brightness + 0.03, 1);
      } else if (inRange) {
        // Hint of star when close
        star.brightness = Math.min(star.brightness + 0.02, 0.3);
      } else {
        star.brightness = Math.max(star.brightness - 0.02, 0);
      }

      drawStar(star, true);
    });

    // Update constellation progress
    constellationProgress = discoveredStars.size / totalStars;

    // Update and draw constellation lines
    constellationLines.forEach(line => {
      if (line.from.discovered && line.to.discovered) {
        line.discovered = true;
        line.brightness = Math.min(line.brightness + 0.02, 1);
      } else {
        line.brightness = Math.max(line.brightness - 0.02, 0);
      }
      drawConstellationLine(line);
    });

    // Check for full reveal
    if (constellationProgress >= 1 && !fullyRevealed) {
      fullyRevealed = true;
      // Celebration particles
      constellationStars.forEach(star => {
        spawnParticles(star.x, star.y, 5, 'white');
      });
    }

    // Shooting stars
    spawnShootingStar();
    shootingStars = shootingStars.filter(star => {
      star.x += star.vx;
      star.y += star.vy;
      star.life -= 0.015;

      if (star.life <= 0) return false;

      drawShootingStar(star);
      return true;
    });

    // Update and draw particles
    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 0.02;

      if (p.life <= 0) return false;

      ctx.fillStyle = p.color === 'gold'
        ? `rgba(255, 220, 100, ${p.life})`
        : `rgba(255, 255, 255, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });

    // Flashlight effect edge (when not fully revealed)
    if (!fullyRevealed && mouseX > 0) {
      const edgeGlow = ctx.createRadialGradient(
        mouseX, mouseY, revealRadius * 0.7,
        mouseX, mouseY, revealRadius * 1.3
      );
      edgeGlow.addColorStop(0, 'transparent');
      edgeGlow.addColorStop(0.5, 'rgba(100, 150, 255, 0.03)');
      edgeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = edgeGlow;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, revealRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw title when fully revealed
    if (fullyRevealed) {
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      ctx.font = `bold ${14 * pulse}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255, 220, 150, ${0.5 + Math.sin(time * 3) * 0.2})`;
      ctx.fillText('CONSTELLATION COSKUN', w / 2, h - 40);
    }

    // Progress indicator
    if (!fullyRevealed) {
      const progressWidth = 100;
      const progressHeight = 4;
      const progressX = w / 2 - progressWidth / 2;
      const progressY = h - 30;

      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(progressX, progressY, progressWidth, progressHeight);

      // Fill
      ctx.fillStyle = `rgba(255, 220, 150, ${0.5 + constellationProgress * 0.5})`;
      ctx.fillRect(progressX, progressY, progressWidth * constellationProgress, progressHeight);

      // Star count
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(`${discoveredStars.size}/${totalStars} stars discovered`, w / 2, progressY + 20);

      // Hint
      if (time > 2 && discoveredStars.size < 5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(time * 2) * 0.1})`;
        ctx.fillText('explore the darkness', w / 2, 40);
      }
    }

    // Vignette
    const vignette = ctx.createRadialGradient(w/2, h/2, h * 0.4, w/2, h/2, h);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    animationId = requestAnimationFrame(render);
  }

  function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Reinitialize
    stars = [];
    constellationStars = [];
    constellationLines = [];
    nebulae = [];
    discoveredStars = new Set();
    fullyRevealed = false;

    if (ctx) {
      init();
    }
  }

  function handleMouseMove(e) {
    mouse = {
      x: e.clientX * (window.devicePixelRatio || 1),
      y: e.clientY * (window.devicePixelRatio || 1)
    };
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    mouse = {
      x: touch.clientX * (window.devicePixelRatio || 1),
      y: touch.clientY * (window.devicePixelRatio || 1)
    };
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

<div class="cosmos" class:mounted>
  <canvas
    bind:this={canvas}
    onmousemove={handleMouseMove}
    ontouchmove={handleTouchMove}
  ></canvas>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    cursor: crosshair;
  }

  :global(html, body) {
    height: 100%;
    overflow: hidden;
    background: #000;
  }

  .cosmos {
    position: fixed;
    inset: 0;
    opacity: 0;
    transition: opacity 1s ease;
  }

  .cosmos.mounted {
    opacity: 1;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
