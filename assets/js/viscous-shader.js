import { isMotionAllowed, onMotionPreferenceChange } from './motion.js';

const FRAME_BUDGET_MS = 24;
const WATCHDOG_WINDOW_MS = 2000;
const POINTER_IDLE_MS = 2500;
const PARALLAX_SMOOTHING = 0.06;

const QUALITY = {
  desktop: { mesh: 200, pressureIterations: 20, simulationRows: 144, maxPixelRatio: 1.5 },
  phone: { mesh: 96, pressureIterations: 10, simulationRows: 96, maxPixelRatio: 1 },
  meshOnly: { mesh: 64, pressureIterations: 0, simulationRows: 32, maxPixelRatio: 1 },
};

const QUAD_VERTEX = `#version 300 es
in vec2 a;out vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0,1);}`;
const QUAD_HEADER = `#version 300 es
precision highp float;in vec2 uv;out vec4 o;uniform vec2 tx;`;
const ADVECT = QUAD_HEADER + `uniform sampler2D F;uniform float dt,asp,dV,dO;
void main(){vec4 s=texture(F,uv);vec2 b=uv-dt*s.xy*vec2(1./asp,1.);vec4 a=texture(F,b);o=vec4(a.xy*dV,a.zw*dO+s.xy*dt);}`;
const SPLAT = QUAD_HEADER + `uniform sampler2D F;uniform vec2 p,f;uniform float r,asp;
void main(){vec4 s=texture(F,uv);vec2 d=uv-p;d.x*=asp;float g=exp(-dot(d,d)/r);o=s+vec4(f*g,0,0);}`;
const DIFFUSE = QUAD_HEADER + `uniform sampler2D X,B;uniform float al;
void main(){vec4 l=texture(X,uv-vec2(tx.x,0)),r=texture(X,uv+vec2(tx.x,0)),t=texture(X,uv+vec2(0,tx.y)),b=texture(X,uv-vec2(0,tx.y));o=(texture(B,uv)+al*(l+r+t+b))/(1.+4.*al);}`;
const DIVERGENCE = QUAD_HEADER + `uniform sampler2D F;
void main(){float l=texture(F,uv-vec2(tx.x,0)).x,r=texture(F,uv+vec2(tx.x,0)).x,t=texture(F,uv+vec2(0,tx.y)).y,b=texture(F,uv-vec2(0,tx.y)).y;o=vec4(.5*(r-l+t-b),0,0,1);}`;
const PRESSURE = QUAD_HEADER + `uniform sampler2D P,D;
void main(){float l=texture(P,uv-vec2(tx.x,0)).x,r=texture(P,uv+vec2(tx.x,0)).x,t=texture(P,uv+vec2(0,tx.y)).x,b=texture(P,uv-vec2(0,tx.y)).x;o=vec4((l+r+t+b-texture(D,uv).x)*.25,0,0,1);}`;
const GRADIENT = QUAD_HEADER + `uniform sampler2D F,P;
void main(){float l=texture(P,uv-vec2(tx.x,0)).x,r=texture(P,uv+vec2(tx.x,0)).x,t=texture(P,uv+vec2(0,tx.y)).x,b=texture(P,uv-vec2(0,tx.y)).x;vec4 s=texture(F,uv);s.xy-=.5*vec2(r-l,t-b);o=s;}`;
const NOISE = `vec3 m3(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m4(vec4 x){return x-floor(x*(1./289.))*289.;}vec4 pm(vec4 x){return m4(((x*34.)+1.)*x);}vec4 ti(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=m3(i);
vec4 p=pm(pm(pm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 nm=ti(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const PLANE_VERTEX = `#version 300 es
precision highp float;in vec2 a;uniform mat4 P,V,M;uniform mat2 S2M;uniform sampler2D F;uniform float t,den,frq,amp,str;uniform vec3 c1,c2,c3;out vec3 vW,vN,vC;out float vSp;
` + NOISE + `
float Hh(vec2 q){float n=snoise(vec3(q*.3*den,t*.5));float w=sin(q.x*.18*frq+q.y*.06*frq+t*1.3)*amp;return (n*.8+w*.2)*str*.1;}
void main(){vec4 c0=P*V*M*vec4(a,0,1);vec2 s=clamp(c0.xy/c0.w*.5+.5,0.,1.);vec4 f=textureLod(F,s,0.);
vec2 q=a-S2M*f.zw;float h=Hh(q);float e=.04;float hx=Hh(q+vec2(e,0))-Hh(q-vec2(e,0));float hy=Hh(q+vec2(0,e))-Hh(q-vec2(0,e));
vec3 n=normalize(vec3(-hx/(2.*e),-hy/(2.*e),1.));float sp=length(f.xy);h+=min(sp,2.)*.04;
vec4 w=M*vec4(a,h,1.);vW=w.xyz;vN=mat3(M)*n;vSp=sp;
float k=snoise(vec3(q*.22*den+3.,t*.3));float m1=smoothstep(-.55,.6,h/(str*.1));vec3 col=mix(c2,c1,m1);col=mix(col,c3,smoothstep(.2,.9,k)*.85);vC=col;
gl_Position=P*V*w;}`;
const PLANE_FRAGMENT = `#version 300 es
precision highp float;in vec3 vW,vN,vC;in float vSp;out vec4 o;uniform vec3 cam;uniform float t,bright,refl;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec3 N=normalize(vN);vec3 V=normalize(cam-vW);if(dot(N,V)<0.)N=-N;vec3 L=normalize(vec3(.5,.7,-1.));float d=max(dot(N,L),0.);
vec3 col=vC*(.62+.45*d);vec3 R=reflect(-V,N);vec3 env=mix(vec3(.72,.74,.8),vec3(1.,.95,.88),smoothstep(-.3,.6,R.y));float fr=pow(1.-max(dot(N,V),0.),4.);
col=mix(col,env,clamp(refl+fr*.3,0.,1.));float sp=pow(max(dot(R,L),0.),48.);col+=sp*(.1+min(vSp,1.5)*.3);col*=bright;
col+=(hash(gl_FragCoord.xy+fract(t*7.)*100.)-.5)*.07;o=vec4(col,1);}`;

function cssColor(element, name) {
  const channels = getComputedStyle(element).getPropertyValue(name).trim().split(/\s+/);
  return channels.map((channel) => Number(channel) / 255);
}

function createRenderer(gl, quality, withFluid, surface) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = (vertex, fragment) => {
    const handle = gl.createProgram();
    gl.attachShader(handle, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(handle, compile(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(handle, 0, 'a');
    gl.linkProgram(handle);
    if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) throw new Error('shader link failed');
    const uniforms = {};
    const count = gl.getProgramParameter(handle, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(handle, i).name;
      uniforms[name] = gl.getUniformLocation(handle, name);
    }
    return { handle, uniforms };
  };

  const programs = {
    advect: program(QUAD_VERTEX, ADVECT),
    splat: program(QUAD_VERTEX, SPLAT),
    diffuse: program(QUAD_VERTEX, DIFFUSE),
    divergence: program(QUAD_VERTEX, DIVERGENCE),
    pressure: program(QUAD_VERTEX, PRESSURE),
    gradient: program(QUAD_VERTEX, GRADIENT),
    plane: program(PLANE_VERTEX, PLANE_FRAGMENT),
  };

  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const n = quality.mesh;
  const positions = [];
  const indices = [];
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) positions.push(-5 + (10 * i) / n, -5 + (10 * j) / n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i;
      indices.push(a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1);
    }
  }
  const plane = gl.createVertexArray();
  gl.bindVertexArray(plane);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  const setUniform = (uniforms, name, ...values) => {
    const location = uniforms[name] ?? null;
    if (values.length === 1) gl.uniform1f(location, values[0]);
    else if (values.length === 2) gl.uniform2f(location, values[0], values[1]);
    else gl.uniform3f(location, values[0], values[1], values[2]);
  };
  const bindTexture = (uniforms, name, unit, target) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.uniform1i(uniforms[name] ?? null, unit);
  };

  let fluid = withFluid;
  let simWidth = 1;
  let simHeight = 1;
  let width = 1;
  let height = 1;
  let aspect = 1;
  let field;
  let pressure;
  let divergence;

  const target = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simWidth, simHeight, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    let framebuffer = null;
    if (fluid) {
      framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    return { texture, framebuffer };
  };

  const pass = (shader, destination, setup) => {
    gl.useProgram(shader.handle);
    setUniform(shader.uniforms, 'tx', 1 / simWidth, 1 / simHeight);
    setup(shader.uniforms);
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);
    gl.viewport(0, 0, simWidth, simHeight);
    gl.bindVertexArray(quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const fov = (45 * Math.PI) / 180;
  const distance = 3.6;
  const viewHeight = 2 * distance * Math.tan(fov / 2);
  const view = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -distance, 1];
  const tiltB = (10 * Math.PI) / 180;
  const tiltC = (50 * Math.PI) / 180;
  const cb = Math.cos(tiltB);
  const sb = Math.sin(tiltB);
  const cc = Math.cos(tiltC);
  const sc = Math.sin(tiltC);
  const model = [cb * cc, sc, -sb * cc, 0, -cb * sc, cc, sb * sc, 0, sb, 0, cb, 0, -1.4, 0, 0, 1];
  const det = -cb;
  const screenToModel = [(cc / det) * viewHeight, (-sc / det) * viewHeight, ((-cb * sc) / det) * viewHeight, ((-cb * cc) / det) * viewHeight];
  const perspective = (a) => {
    const t = 1 / Math.tan(fov / 2);
    const near = 0.1;
    const far = 100;
    return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
  };

  const colors = {
    c1: cssColor(surface, '--shader-1'),
    c2: cssColor(surface, '--shader-2'),
    c3: cssColor(surface, '--shader-3'),
  };

  return {
    resize(cssWidth, cssHeight) {
      if (!(cssWidth > 0 && cssHeight > 0)) return;
      const ratio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
      width = Math.max(1, Math.round(cssWidth * ratio));
      height = Math.max(1, Math.round(cssHeight * ratio));
      gl.canvas.width = width;
      gl.canvas.height = height;
      aspect = width / height;
      simHeight = quality.simulationRows;
      simWidth = Math.max(1, Math.min(Math.round(simHeight * aspect), gl.getParameter(gl.MAX_TEXTURE_SIZE)));
      field = [target(), target(), target()];
      pressure = [target(), target()];
      divergence = target();
    },
    disableFluid() {
      fluid = false;
      this.resize(gl.canvas.clientWidth, gl.canvas.clientHeight);
    },
    get hasFluid() {
      return fluid;
    },
    draw(dt, time, pointer) {
      if (!field) return;
      if (fluid) {
        const viscosity = 0.65;
        const memory = 0.6;
        const velocityDecay = Math.exp(-dt * (0.8 + 3.5 * viscosity));
        const offsetDecay = Math.exp(-dt * (3.2 - 3.05 * memory));
        const alpha = 0.3 + 30 * viscosity * viscosity;
        pass(programs.advect, field[1], (u) => {
          bindTexture(u, 'F', 0, field[0]);
          setUniform(u, 'dt', dt);
          setUniform(u, 'asp', aspect);
          setUniform(u, 'dV', velocityDecay);
          setUniform(u, 'dO', offsetDecay);
        });
        [field[0], field[1]] = [field[1], field[0]];
        if (pointer.moved && dt > 0) {
          const strength = (0.25 + 0.5 * 2.2) * (1 - 0.45 * viscosity);
          let fx = (pointer.dx / dt) * strength;
          let fy = (pointer.dy / dt) * strength;
          const magnitude = Math.hypot(fx, fy);
          if (magnitude > 10) {
            fx *= 10 / magnitude;
            fy *= 10 / magnitude;
          }
          pass(programs.splat, field[1], (u) => {
            bindTexture(u, 'F', 0, field[0]);
            setUniform(u, 'p', pointer.x, pointer.y);
            setUniform(u, 'f', fx, fy);
            setUniform(u, 'r', 0.0025 + viscosity * 0.003);
            setUniform(u, 'asp', aspect);
          });
          [field[0], field[1]] = [field[1], field[0]];
        }
        let source = field[0];
        const [, a, b] = field;
        for (let i = 0; i < 8; i++) {
          const destination = i % 2 ? b : a;
          const from = source;
          pass(programs.diffuse, destination, (u) => {
            bindTexture(u, 'X', 0, from);
            bindTexture(u, 'B', 1, field[0]);
            setUniform(u, 'al', alpha);
          });
          source = destination;
        }
        field = [source, field[0], source === a ? b : a];
        pass(programs.divergence, divergence, (u) => bindTexture(u, 'F', 0, field[0]));
        for (let i = 0; i < quality.pressureIterations; i++) {
          pass(programs.pressure, pressure[1], (u) => {
            bindTexture(u, 'P', 0, pressure[0]);
            bindTexture(u, 'D', 1, divergence);
          });
          [pressure[0], pressure[1]] = [pressure[1], pressure[0]];
        }
        pass(programs.gradient, field[1], (u) => {
          bindTexture(u, 'F', 0, field[0]);
          bindTexture(u, 'P', 1, pressure[0]);
        });
        [field[0], field[1]] = [field[1], field[0]];
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.clearColor(...colors.c2, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      const u = programs.plane.uniforms;
      gl.useProgram(programs.plane.handle);
      gl.uniformMatrix4fv(u.P, false, perspective(aspect));
      gl.uniformMatrix4fv(u.V, false, view);
      gl.uniformMatrix4fv(u.M, false, model);
      gl.uniformMatrix2fv(u.S2M, false, screenToModel);
      bindTexture(u, 'F', 0, field[0]);
      setUniform(u, 't', time);
      setUniform(u, 'den', 1.3);
      setUniform(u, 'frq', 5.5);
      setUniform(u, 'amp', 1);
      setUniform(u, 'str', 4);
      setUniform(u, 'c1', ...colors.c1);
      setUniform(u, 'c2', ...colors.c2);
      setUniform(u, 'c3', ...colors.c3);
      setUniform(u, 'cam', 0, 0, -distance);
      setUniform(u, 'bright', 1.08);
      setUniform(u, 'refl', 0.08);
      gl.bindVertexArray(plane);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.DEPTH_TEST);
    },
  };
}

function createPointer(surface) {
  const state = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, lastReal: -Infinity, last: null };
  surface.addEventListener('pointermove', (event) => {
    const rect = surface.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    if (state.last) {
      state.dx += (x - state.last[0]) * (rect.width / rect.height);
      state.dy += y - state.last[1];
      state.moved = true;
    }
    state.last = [x, y];
    state.x = x;
    state.y = y;
    state.lastReal = performance.now();
  }, { passive: true });

  let ghostPrevious = null;
  return {
    sample(now, time) {
      if (now - state.lastReal > POINTER_IDLE_MS) {
        state.last = null;
        const ghost = [0.5 + 0.34 * Math.sin(time * 0.9), 0.5 + 0.26 * Math.sin(time * 1.3 + 1.2)];
        if (ghostPrevious) {
          state.dx += (ghost[0] - ghostPrevious[0]) * (surface.clientWidth / surface.clientHeight);
          state.dy += ghost[1] - ghostPrevious[1];
          state.moved = true;
        }
        ghostPrevious = ghost;
        [state.x, state.y] = ghost;
      } else {
        ghostPrevious = null;
      }
      const sample = { x: state.x, y: state.y, dx: state.dx, dy: state.dy, moved: state.moved };
      state.dx = 0;
      state.dy = 0;
      state.moved = false;
      return sample;
    },
  };
}

function createParallax(stage) {
  let current = [0, 0];
  return (pointer) => {
    if (!stage) return;
    const target = [(pointer.x - 0.5) * 2, (0.5 - pointer.y) * 2];
    current = current.map((value, axis) => value + (target[axis] - value) * PARALLAX_SMOOTHING);
    stage.style.setProperty('--px', current[0].toFixed(3));
    stage.style.setProperty('--py', current[1].toFixed(3));
  };
}

function startGround(ground) {
  const canvas = ground.querySelector('.shader-canvas');
  if (!canvas) return;

  const fallBackToDrift = () => {
    ground.classList.remove('is-live');
    ground.classList.toggle('is-drifting', isMotionAllowed());
  };

  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) {
    fallBackToDrift();
    onMotionPreferenceChange(fallBackToDrift);
    return;
  }

  const fluidCapable = Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  const isPhone = matchMedia('(pointer: coarse), (max-width: 48rem)').matches;
  const quality = fluidCapable ? (isPhone ? QUALITY.phone : QUALITY.desktop) : QUALITY.meshOnly;

  let renderer;
  try {
    renderer = createRenderer(gl, quality, fluidCapable, ground);
  } catch {
    fallBackToDrift();
    return;
  }

  const pointer = createPointer(ground);
  const parallax = createParallax(ground.querySelector('.stage'));
  let frameId = 0;
  let previous = 0;
  let time = 0;
  let heroVisible = true;
  let lost = false;
  let watchdog = { start: 0, frames: 0, total: 0 };

  const resize = () => renderer.resize(canvas.clientWidth, canvas.clientHeight);
  resize();
  new ResizeObserver(resize).observe(canvas);

  const downgrade = () => {
    if (renderer.hasFluid) {
      renderer.disableFluid();
      return;
    }
    stop();
    lost = true;
    fallBackToDrift();
  };

  const frame = (now) => {
    const dt = Math.min((now - previous) / 1000, 1 / 30);
    const elapsed = now - previous;
    previous = now;
    time += dt * 0.4;
    const sample = pointer.sample(now, time);
    renderer.draw(dt, time, sample);
    parallax(sample);

    watchdog.frames += 1;
    watchdog.total += elapsed;
    if (now - watchdog.start > WATCHDOG_WINDOW_MS) {
      if (watchdog.total / watchdog.frames > FRAME_BUDGET_MS) downgrade();
      watchdog = { start: now, frames: 0, total: 0 };
    }
    if (frameId) frameId = requestAnimationFrame(frame);
  };

  const start = () => {
    if (frameId || lost) return;
    previous = performance.now();
    watchdog = { start: previous, frames: 0, total: 0 };
    frameId = requestAnimationFrame(frame);
  };

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  const update = () => {
    if (lost) return;
    const shouldRun = heroVisible && !document.hidden && isMotionAllowed();
    if (shouldRun) start();
    else stop();
  };

  renderer.draw(0, time, pointer.sample(performance.now(), time));
  ground.classList.add('is-live');

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
    lost = true;
    fallBackToDrift();
  });

  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    update();
  }).observe(ground);
  document.addEventListener('visibilitychange', update);
  onMotionPreferenceChange(update);
  update();
}

const whenIdle = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 200));
whenIdle(() => document.querySelectorAll('[data-shader]').forEach(startGround), { timeout: 1500 });
