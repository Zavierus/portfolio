import * as THREE from "three";

function slab(profile, depth, material) {
  const shape = new THREE.Shape();
  profile.forEach(([x, y], index) => index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.08, bevelThickness: 0.08 });
  geometry.center();
  return new THREE.Mesh(geometry, material);
}

export class Megastructure {
  constructor({ scene }) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "listener-megastructure";
    scene.add(this.group);
    this.materials = {
      dark: new THREE.MeshStandardMaterial({ color: 0x060909, roughness: 0.94, metalness: 0.16, transparent: true }),
      mineral: new THREE.MeshStandardMaterial({ color: 0x1a2322, roughness: 0.78, metalness: 0.38, transparent: true }),
      inner: new THREE.MeshStandardMaterial({ color: 0x110e0d, emissive: 0x290502, emissiveIntensity: 0, roughness: 0.68 }),
      membrane: new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        fog: true,
        side: THREE.DoubleSide,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          { uTime: { value: 0 }, uPulse: { value: 0 } },
        ]),
        vertexShader: `
          #include <fog_pars_vertex>
          varying vec2 vUv;
          uniform float uTime;
          uniform float uPulse;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin(uv.y * 20.0 + uTime) * 0.12 * uPulse;
            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }
        `,
        fragmentShader: `
          #include <fog_pars_fragment>
          varying vec2 vUv;
          uniform float uPulse;
          void main() {
            float veins = smoothstep(.97, 1., sin(vUv.y * 67. + sin(vUv.x * 14.) * 4.) * .5 + .5);
            vec3 c = mix(vec3(.018, .034, .033), vec3(.48, .025, .012), veins * uPulse);
            gl_FragColor = vec4(c, (.012 + veins * .1) * uPulse);
            #include <fog_fragment>
          }
        `,
      }),
    };
    const descriptors = [
      { profile: [[-1, -1], [0.6, -0.92], [1, -0.15], [0.7, 1], [-0.8, 0.78]], scale: [8.5, 10.5, 1.5], position: [-8.2, 1.1, -13], rotation: -0.08, material: "dark" },
      { profile: [[-1, -0.55], [0.72, -1], [1, 0.42], [0.18, 1], [-0.88, 0.65]], scale: [9.8, 5.6, 1.2], position: [3.8, 7.4, -16], rotation: 0.18, material: "mineral" },
      { profile: [[-1, -0.84], [0.28, -1], [1, -0.16], [0.62, 1], [-0.64, 0.72]], scale: [7.2, 8.4, 1.6], position: [9.1, -2.2, -15], rotation: -0.2, material: "dark" },
      { profile: [[-1, -0.42], [0.8, -1], [1, 0.28], [0.2, 1], [-0.72, 0.55]], scale: [5.8, 4.2, 1], position: [-0.5, -7.2, -12], rotation: 0.1, material: "inner" },
    ];
    this.slabs = descriptors.map((descriptor, index) => {
      const mesh = slab(descriptor.profile, 1, this.materials[descriptor.material]);
      mesh.name = `megastructure-slice-${index + 1}`;
      mesh.scale.fromArray(descriptor.scale);
      mesh.position.fromArray(descriptor.position);
      mesh.rotation.z = descriptor.rotation;
      mesh.userData.basePosition = mesh.position.clone();
      mesh.userData.baseRotation = descriptor.rotation;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      return mesh;
    });
    this.membrane = new THREE.Mesh(new THREE.PlaneGeometry(11, 13, 18, 24), this.materials.membrane);
    this.membrane.position.set(0.7, 0.2, -11.5);
    this.membrane.rotation.z = -0.16;
    this.group.add(this.membrane);
    this.scaleMarker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xebeae4 }));
    this.scaleMarker.position.set(-1.8, -4.2, -5.5);
    this.group.add(this.scaleMarker);
  }

  update(state) {
    this.slabs.forEach((mesh, index) => {
      mesh.visible = state.reveal > 0.01 || index === 0;
      mesh.material.opacity = index === 0 ? 0.07 + state.reveal * 0.52 : state.reveal * 0.62;
      mesh.position.copy(mesh.userData.basePosition);
      mesh.position.x += (index - 1.5) * state.fold * 0.7;
      mesh.position.x += (index - 1.5) * state.aperture * 1.35;
      const horizontalDirection = index < 2 ? -1 : 1;
      mesh.position.x += horizontalDirection * state.reconstruction * (2.4 + index * 0.55);
      mesh.position.y += (index === 1 ? 1 : index === 3 ? -1 : 0) * state.reconstruction * 2.2;
      mesh.position.z += (index % 2 ? -1 : 1) * state.fold * 0.8;
      mesh.rotation.z = mesh.userData.baseRotation + (index - 1.5) * state.fold * 0.035;
      mesh.material.opacity *= 1 - state.reconstruction * 0.72;
    });
    this.materials.inner.emissiveIntensity = state.membranePulse * 0.85;
    this.materials.membrane.uniforms.uTime.value = state.time;
    this.materials.membrane.uniforms.uPulse.value = state.membranePulse;
    this.membrane.visible = state.membranePulse > 0.01;
    this.scaleMarker.visible = state.reveal > 0.3;
  }

  dispose() {
    this.group.traverse((object) => object.geometry?.dispose?.());
    Object.values(this.materials).forEach((material) => material.dispose());
    this.scaleMarker.material.dispose();
    this.scene.remove(this.group);
  }
}
