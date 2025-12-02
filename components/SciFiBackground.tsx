
import React, { useEffect, useRef } from 'react';

// Define the available states that affect color
type BackgroundState = 'default' | 'about' | 'portfolio-gd' | 'music' | 'contact' | 'portfolio-ta' | 'portfolio-others';

interface SciFiBackgroundProps {
  appState?: string; // We'll receive the raw app state string
}

const SciFiBackground: React.FC<SciFiBackgroundProps> = ({ appState = 'start' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs accessible to the animation loop closure
  const currentColorRef = useRef<[number, number, number]>([0.0, 0.05, 0.21]);
  const targetColorRef = useRef<[number, number, number]>([0.0, 0.05, 0.21]);

  // Color Mapping Logic
  const getColorTarget = (state: string): [number, number, number] => {
    switch (state) {
      case 'about':
      case 'cv-gd':
      case 'cv-ta':
        return [0.35, 0.1, 0.02]; // Sober Orange/Rust (Warm, Human)
      
      case 'portfolio-gd':
        return [0.25, 0.2, 0.05]; // Sober Gold/Brass (Prestige, Design)

      case 'portfolio-ta':
        return [0.0, 0.2, 0.25]; // Sober Electric Cyan/Teal (Tech, 3D)

      case 'portfolio-others':
        return [0.05, 0.2, 0.1]; // Sober Deep Green/Forest (Experimental, Miscellaneous)

      case 'music':
        return [0.12, 0.0, 0.18]; // Sober Violet/Deep Purple (Audio, Synthwave)

      case 'contact':
        return [0.0, 0.15, 0.2]; // Sober Cyan/Teal (Communication, Tech)

      case 'start':
      case 'menu':
      case 'loading':
      default:
        return [0.0, 0.05, 0.21]; // Original Deep Blue (Default Space)
    }
  };

  // Update target whenever appState changes
  useEffect(() => {
    targetColorRef.current = getColorTarget(appState);
  }, [appState]);

  // WebGL Initialization and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // PERFORMANCE OPTIMIZATION:
    // Robust detection for Mobile/Tablet to disable heavy WebGL shaders.
    // 1. Check User Agent for common mobile identifiers.
    // 2. Check Screen Width via matchMedia (more stable than innerWidth).
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileUA || isSmallScreen) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let id: number;
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        const loop2D = () => {
            // Smooth Color Interpolation (Same logic as shader but for 2D fill)
            const [cr, cg, cb] = currentColorRef.current;
            const [tr, tg, tb] = targetColorRef.current;
            const easing = 0.02;

            const nr = cr + (tr - cr) * easing;
            const ng = cg + (tg - cg) * easing;
            const nb = cb + (tb - cb) * easing;

            currentColorRef.current = [nr, ng, nb];

            // Fill background with solid color
            // Multiply by 255 for RGB strings
            ctx.fillStyle = `rgb(${Math.floor(nr * 255)}, ${Math.floor(ng * 255)}, ${Math.floor(nb * 255)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            id = requestAnimationFrame(loop2D);
        };
        loop2D();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(id);
        };
    }

    // --- DESKTOP: FULL SHADER ---
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // --- SHADERS ---
    const vsSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec3 uBaseColor; 
      uniform sampler2D iChannel0;
      #define textureLod(s, u, l) texture2D(s, u)

      // --- USER SHADER START ---
      float t;
      float cosPath(vec3 p, vec3 dec){return dec.x * cos(p.z * dec.y + dec.z);}
      float sinPath(vec3 p, vec3 dec){return dec.x * sin(p.z * dec.y + dec.z);}
      #define Tunnel(p,pos,c,s) p.xy-pos-vec2(cosPath(p, c),sinPath(p, s))

      vec3 getHotColor(float Temp) {
        vec3 col = vec3(255.);
        col.x = 56100000. * pow(Temp,(-3. / 2.)) + 148.;
        col.y = 100.04 * log(Temp) - 623.6;
        if (Temp > 6500.) col.y = 35200000. * pow(Temp,(-3. / 2.)) + 184.;
        col.z = 194.18 * log(Temp) - 1448.6;
        col = clamp(col, 0., 255.)/255.;
        if (Temp < 1000.) col *= Temp/1000.;
        return col;
      }

      float pn( in vec3 x ) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f*f*(3.0-2.0*f);
        vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
        vec2 rg = textureLod(iChannel0, (uv+ 0.5)/256.0, 0.0 ).yx;
        return -1.0+2.4*mix( rg.y, rg.x, f.z );
      }

      float df(vec3 p) {
        float pnNoise = pn(p*.26)*1.98 + pn(p*.26)*.62 + pn(p*1.17)*.39;
        float path = sinPath(p ,vec3(5.704,0.3828,0.16));
        float bt = min(p.y, -p.y) + 12.;
        float df;
        vec4 vec, var;
        for (float i=0.;i<4.;i++) {
          var = vec4(0.35,2.5,5.8,0) + vec4(0.5,0.06,0,5) * i;
          vec.xy = Tunnel(p, vec2(path, 0.), var.xyz, var.zxy);
          df = var.w - min(length(vec.xy), length(vec.zw));
          vec.zw = vec.xy;	
        }
        return min(df, bt) + pnNoise;
      }

      vec3 cam(vec2 uv, vec3 ro, vec3 cu, vec3 cv, float fov) {
        vec3 rov = normalize(cv-ro);
        vec3 u = normalize(cross(cu, rov));
        vec3 v = normalize(cross(rov, u));
        vec3 rd = normalize(rov + fov*u*uv.x + fov*v*uv.y);
        return rd;
      }

      vec4 march(vec4 f, vec3 ro, vec3 rd, float st) {
        float s = 1., h = .25, td = 0., d=1.,dl=0., w;
        vec3 p = ro;
        for(float i=0.;i<100.;i++) {      
          if(s<0.01||d>50.||td>.95) break;
          s = df(p) * .09 * i/50.;
          if (s < h) {
            w = (1.-td) * (h-s) * i/60.;
            f.rgb += getHotColor(td*i*70.) * (.05-w)* 0.1;
            td += w;
          }
          dl += 1.01 - exp(-0.001 * log(d));	
          td += 0.01;
          s = max(s, st);
          d+=s; 
          p = ro+rd*d;	
        }
        f.rgb = mix( f.rgb, vec3(0), 1.0 - exp( -0.002*d*d) )/dl; 
        return f;
      }

      void mainImage( out vec4 f, in vec2 g ) {
        t = iTime * 0.15; 
        f = vec4(uBaseColor, 1.0); // Dynamic Color Base
        vec2 q = g/iResolution.xy;
        vec3 ro = vec3(cos(t*.5), sin(t*.2),t )*vec3(8.5, 8.5, 5.);
        vec3 rd = cam((2.*g-iResolution.xy)/iResolution.y, ro, vec3(0,1,0), ro + vec3(0,0,1), 3.5);
        f = march(f, ro, rd, 0.25);
        f.rgb *= 0.5 + 0.5*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.25 ); 
      }
      // --- USER SHADER END ---

      void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
    `;

    // Shader Boilerplate
    const compile = (t: number, s: string) => {
      const o = gl.createShader(t);
      if(!o) return null;
      gl.shaderSource(o, s);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(o));
        return null;
      }
      return o;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if(!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Geometry
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Texture (Noise)
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const nSz = 256;
    const nDat = new Uint8Array(nSz*nSz*4);
    for(let i=0; i<nDat.length; i++) nDat[i] = Math.random()*255;
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,nSz,nSz,0,gl.RGBA,gl.UNSIGNED_BYTE,nDat);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // Uniforms
    const uRes = gl.getUniformLocation(prog, 'iResolution');
    const uTime = gl.getUniformLocation(prog, 'iTime');
    const uColor = gl.getUniformLocation(prog, 'uBaseColor');
    gl.uniform1i(gl.getUniformLocation(prog, 'iChannel0'), 0);

    const handleResize = () => {
      // PERFORMANCE OPTIMIZATION: Cap Device Pixel Ratio at 2.0
      // Phones often have 3.0 or 4.0, which kills performance on complex shaders
      const dpr = Math.min(window.devicePixelRatio, 2.0);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let id: number;
    const t0 = Date.now();

    const loop = () => {
      const now = (Date.now() - t0) / 1000;
      gl.uniform1f(uTime, now);

      // Smooth Color Interpolation
      const [cr, cg, cb] = currentColorRef.current;
      const [tr, tg, tb] = targetColorRef.current;
      const easing = 0.02; // Very smooth transition

      currentColorRef.current = [
        cr + (tr - cr) * easing,
        cg + (tg - cg) * easing,
        cb + (tb - cb) * easing
      ];

      gl.uniform3f(uColor, currentColorRef.current[0], currentColorRef.current[1], currentColorRef.current[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      id = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(id);
    };
  }, []); // Init once

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />;
};

export default SciFiBackground;
