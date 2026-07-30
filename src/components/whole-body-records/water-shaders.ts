export const waterVertexShader = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export const waterFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uScrollProgress;
  uniform float uScrollSpeed;
  uniform vec3 uColorBase;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorSurface;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.04 + 13.7;
      amplitude *= 0.49;
    }
    return value;
  }

  vec3 inkSignal() {
    return vec3(45.0, 156.0, 219.0) / 255.0;
  }

  void main() {
    vec2 centered = vUv - 0.5;
    centered.x *= uResolution.x / max(uResolution.y, 1.0);

    float time = uTime * 0.28 / (1.0 + abs(uScrollSpeed) * 1.45);
    vec2 domain = centered * 1.42;
    domain.y += uScrollProgress * 0.72;
    vec2 flow = vec2(
      fbm(domain * 1.45 + vec2(time * 0.22, -time * 0.15)),
      fbm(domain * 1.35 + vec2(-time * 0.12, time * 0.19) + 8.3)
    ) - 0.5;
    domain += flow * 1.15;

    vec2 pointer = uPointer - 0.5;
    pointer.x *= uResolution.x / max(uResolution.y, 1.0);
    float rippleDistance = distance(centered, pointer);
    float rippleEnergy = uPointerActive * 0.28 + uScrollSpeed * 0.05;
    float ripple = sin(rippleDistance * 32.0 - uTime * 2.1)
      * exp(-rippleDistance * 5.8)
      * rippleEnergy;
    domain += normalize(centered - pointer + vec2(0.0001)) * ripple;

    float fieldA = fbm(domain * 2.15 + vec2(time * 0.32, -time * 0.18));
    float fieldB = fbm(domain * 3.35 - flow * 1.6 - vec2(time * 0.13, time * 0.11));
    float density = smoothstep(0.18, 0.88, fieldA * 0.72 + fieldB * 0.48);

    vec2 causticUv = domain * 5.2 + flow * 4.0;
    float causticA = abs(sin(causticUv.x + time * 1.2) + sin(causticUv.y * 1.18 - time * 0.75));
    float causticB = abs(sin((causticUv.x + causticUv.y) * 0.72 - time * 0.58));
    float caustic = 1.0 - smoothstep(0.18, 0.72, causticA * causticB);
    caustic *= smoothstep(0.18, 0.9, density) * 0.68;

    float depth = smoothstep(
      -0.48,
      0.72,
      centered.y + fieldA * 0.38 + uScrollProgress * 0.16
    );

    // A lower-third signal current: harmonic motion carries discrete
    // information packets through a single Studios-blue current.
    float signalCenter = 0.30
      + sin(vUv.x * 6.4 + uTime * 0.19) * 0.055
      + sin(vUv.x * 15.0 - uTime * 0.11) * 0.018
      + (fieldA - 0.5) * 0.025;
    float signalDistance = abs(vUv.y - signalCenter);
    float signalGlow = exp(-signalDistance * 15.0);
    float signalCore = exp(-signalDistance * 52.0);
    float packetPhase = fract(
      vUv.x * 6.0 - uTime * 0.045 + fieldB * 0.11
    );
    float packet = 1.0 - smoothstep(
      0.0,
      0.13,
      abs(packetPhase - 0.5)
    );
    float harmonic = 0.5 + 0.5 * sin(
      vUv.x * 64.0 - uTime * 0.78 + fieldA * 4.0
    );
    harmonic = pow(harmonic, 8.0);
    vec3 signalColor = inkSignal();

    vec3 color = mix(uColorBase, uColorSecondary, density * 0.76);
    color = mix(color, uColorPrimary, (density * 0.48 + caustic * 0.42) * depth);
    color = mix(color, uColorSurface, caustic * 0.11);

    float signalEnergy = signalGlow * 0.18
      + signalCore * (0.25 + packet * 0.45 + harmonic * 0.18);
    color = mix(color, signalColor, clamp(signalEnergy, 0.0, 0.62));
    color += signalColor * signalCore * packet * 0.15;

    float vignette = smoothstep(1.05, 0.18, length(centered * vec2(0.72, 1.0)));
    color = mix(uColorBase, color, 0.34 + vignette * 0.66);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const icosahedronVertexShader = `
  precision highp float;

  attribute vec3 aPosition;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uScrollProgress;
  uniform vec3 uAnchor;
  uniform float uScale;
  uniform float uPhase;
  uniform float uSpin;
  uniform float uDrift;
  uniform float uDriftRate;
  uniform vec3 uRotationAxis;

  varying float vFacing;
  varying float vDepth;

  mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }

  mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }

  mat3 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
  }

  vec3 rotateAroundAxis(vec3 point, vec3 axis, float angle) {
    vec3 unitAxis = normalize(axis);
    float c = cos(angle);
    float s = sin(angle);
    return point * c
      + cross(unitAxis, point) * s
      + unitAxis * dot(unitAxis, point) * (1.0 - c);
  }

  void main() {
    float rotation = uTime * uSpin + uPhase;
    vec3 point = rotateAroundAxis(aPosition, uRotationAxis, rotation);
    point = rotateY(rotation * 0.23 + uPhase * 0.17) * point;

    float depth = clamp(uAnchor.z, 0.0, 1.0);
    float bob = sin(uTime * uDriftRate + uPhase) * uDrift;
    float sway = cos(
      uTime * uDriftRate * 0.83 + uPhase * 1.7
    ) * uDrift * 1.35;
    vec2 pointerParallax = (uPointer - 0.5)
      * uPointerActive
      * mix(0.045, 0.012, depth);
    vec2 anchor = uAnchor.xy + vec2(sway, bob) + pointerParallax;
    anchor.y += (uScrollProgress - 0.5) * mix(0.09, 0.025, depth);

    float aspect = uResolution.x / max(uResolution.y, 1.0);
    float depthScale = mix(1.0, 0.48, depth);
    vec2 projected = anchor + vec2(point.x / aspect, point.y)
      * uScale
      * depthScale;

    gl_Position = vec4(projected, mix(-0.25, 0.25, depth), 1.0);
    vFacing = 0.5 + 0.5 * point.z;
    vDepth = depth;
  }
`;

export const icosahedronFragmentShader = `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vFacing;
  varying float vDepth;

  void main() {
    float depthFade = mix(1.0, 0.32, vDepth);
    float facingLight = 0.62 + vFacing * 0.72;
    gl_FragColor = vec4(
      uColor * facingLight,
      uOpacity * depthFade
    );
  }
`;
