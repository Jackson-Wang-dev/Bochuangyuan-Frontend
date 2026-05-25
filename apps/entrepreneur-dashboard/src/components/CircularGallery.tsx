// @ts-nocheck
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

import './CircularGallery.css';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createCardTexture(gl, data, fontBase = 'Figtree') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // High res for sharp text
  const width = 1000;
  const height = 1400;
  canvas.width = width;
  canvas.height = height;

  // Background - Deep charcoal blue
  context.fillStyle = '#0a0f1e';
  context.beginPath();
  const radius = 80;
  context.roundRect(0, 0, width, height, radius);
  context.fill();

  // Highlight Gradient at the top
  const topGradient = context.createLinearGradient(0, 0, 0, 400);
  topGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
  topGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
  context.fillStyle = topGradient;
  context.fill();

  // Subtle Border
  context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  context.lineWidth = 2;
  context.stroke();

  // Inner Glow/Shadow for depth
  context.strokeStyle = 'rgba(59, 130, 246, 0.1)';
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(2, 2, width-4, height-4, radius-2);
  context.stroke();

  // Date Badge - Modern pill
  context.fillStyle = '#1e3a8a';
  const badgeWidth = 240;
  const badgeHeight = 60;
  const badgeX = 80;
  const badgeY = 100;
  context.beginPath();
  context.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
  context.fill();
  
  context.strokeStyle = 'rgba(59, 130, 246, 0.3)';
  context.lineWidth = 2;
  context.stroke();

  context.font = `900 28px ${fontBase}`;
  context.fillStyle = '#60a5fa';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(data.date.toUpperCase(), badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

  // Title - Large and Bold
  context.font = `900 84px ${fontBase}`;
  context.fillStyle = 'white';
  context.textAlign = 'left';
  context.textBaseline = 'top';
  
  const titleWords = data.title.split(' ');
  let line = '';
  let y = 220;
  const maxWidth = width - 160;
  
  titleWords.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      context.fillText(line, 80, y);
      line = word + ' ';
      y += 100;
    } else {
      line = testLine;
    }
  });
  context.fillText(line, 80, y);

  // Separator
  y += 140;
  context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(80, y);
  context.lineTo(width - 80, y);
  context.stroke();

  // Description
  y += 60;
  context.font = `500 40px ${fontBase}`;
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.lineHeight = 1.6;
  
  const descWords = data.description.split(' ');
  line = '';
  descWords.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      context.fillText(line, 80, y);
      line = word + ' ';
      y += 60;
    } else {
      line = testLine;
    }
  });
  context.fillText(line, 80, y);

  // Footer / Status
  y = height - 150;
  context.font = `900 24px ${fontBase}`;
  context.fillStyle = 'rgba(59, 130, 246, 0.4)';
  context.fillText("GROWTH RECORD / "+ (data.id || 'EV-01'), 80, y);

  // Avatars
  const avatarY = height - 100;
  for (let i = 0; i < 4; i++) {
    context.fillStyle = i === 3 ? '#1e3a8a' : '#1e293b';
    context.beginPath();
    context.arc(100 + i * 50, avatarY, 30, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#0a0f1e';
    context.lineWidth = 4;
    context.stroke();
    
    if (i === 3) {
      context.font = `bold 20px ${fontBase}`;
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText("+12", 100 + i * 50, avatarY);
    }
  }

  const texture = new Texture(gl, { generateMipmaps: true });
  texture.image = canvas;
  return texture;
}


class Media {
  constructor({
    geometry,
    gl,
    data,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.data = data;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.onResize();
  }
  createShader() {
    const texture = createCardTexture(this.gl, this.data, this.font);
    
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec4 color = texture2D(tMap, vUv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [800, 1000] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    // Remove distortion logic (bend) completely to avoid deformation
    this.plane.position.y = 0;
    this.plane.rotation.z = 0;

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    // Keep aspect ratio 8:10
    this.plane.scale.x = this.plane.scale.y * 0.8;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 6; // More space between cards
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05
    } = {}
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 100);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }
  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const galleryItems = items && items.length ? items : [];
    // Concatenate items to allow smooth infinite loop even with few items
    this.mediasImages = galleryItems.concat(galleryItems); 
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        data,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.target; // Use target as base for linear feel
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
    this.container.style.cursor = 'grabbing';
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    // Lower multiplier for slower, more controlled scroll
    const distance = (this.start - x) * 0.8; 
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.container.style.cursor = 'grab';
    this.onCheck();
  }
  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? 1 : -1) * 80; // Smaller wheel step for slower movement
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(this.scroll.target / width);
    this.scroll.target = width * itemIndex;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousewheel', this.boundOnWheel);
    window.addEventListener('wheel', this.boundOnWheel);
    window.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousewheel', this.boundOnWheel);
    window.removeEventListener('wheel', this.boundOnWheel);
    window.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05,
  onScroll
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    appRef.current = app;

    // Override the update method to call onScroll
    const originalUpdate = app.update.bind(app);
    app.update = () => {
      originalUpdate();
      if (onScroll && app.medias && app.medias[0]) {
        const itemWidth = app.medias[0].width;
        const totalItemsCount = app.medias.length;
        // Accurate progress for item count
        const progress = (app.scroll.current / itemWidth) / totalItemsCount;
        onScroll(progress);
      }
    };

    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onScroll]);

  return <div className="circular-gallery" ref={containerRef} />;
}

