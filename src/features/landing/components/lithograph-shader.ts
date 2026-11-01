import * as THREE from "three";

/**
 * Lithograph Shader for Riso Grand Tour.
 * - Remaps diffuse luminance from ink-950 (#0F1215) to bone-100 (#E9E4D8) across 6 discrete LUT tiers.
 * - Injects a 4x4 Bayer screen-space stipple/dither (2.5-3.5px) at tonal transitions.
 * - Preserves real PBR specular highlights, boosted to sharp white rim and glints.
 * - Headlight materials are assigned emissive sun-400 (#E0662F) radiance.
 * - Avoids toon ramp, Sobel outlines, or chromatic aberration.
 */
export function applyLithographShader(
  material: THREE.Material,
  isHeadlight = false
): void {
  if (!("isMeshStandardMaterial" in material) && !("isMeshPhysicalMaterial" in material)) {
    return;
  }

  const mat = material as THREE.MeshStandardMaterial;

  if (isHeadlight) {
    mat.emissive = new THREE.Color(0xe0662f);
    mat.emissiveIntensity = 2.8;
  }

  mat.onBeforeCompile = (shader) => {
    mat.userData.shader = shader;

    const bayerHelper = /* glsl */ `
      float getBayerValue(vec2 coord) {
        vec2 p = floor(coord / 2.5);
        int x = int(mod(p.x, 4.0));
        int y = int(mod(p.y, 4.0));
        int idx = x + y * 4;
        if (idx == 0) return 0.0;
        if (idx == 1) return 8.0;
        if (idx == 2) return 2.0;
        if (idx == 3) return 10.0;
        if (idx == 4) return 12.0;
        if (idx == 5) return 4.0;
        if (idx == 6) return 14.0;
        if (idx == 7) return 6.0;
        if (idx == 8) return 3.0;
        if (idx == 9) return 11.0;
        if (idx == 10) return 1.0;
        if (idx == 11) return 9.0;
        if (idx == 12) return 15.0;
        if (idx == 13) return 7.0;
        if (idx == 14) return 13.0;
        return 5.0;
      }
    `;

    shader.fragmentShader = bayerHelper + shader.fragmentShader;

    const lithoBody = isHeadlight
      ? /* glsl */ `
        #ifdef OPAQUE
        diffuseColor.a = 1.0;
        #endif

        #ifdef USE_TRANSMISSION
        diffuseColor.a *= material.transmissionAlpha;
        #endif

        // Emissive Sun-400 radiance for headlights
        vec3 headlightSun = vec3(0.8784, 0.4000, 0.1843) * 2.2;
        gl_FragColor = vec4(headlightSun, diffuseColor.a);
      `
      : /* glsl */ `
        #ifdef OPAQUE
        diffuseColor.a = 1.0;
        #endif

        #ifdef USE_TRANSMISSION
        diffuseColor.a *= material.transmissionAlpha;
        #endif

        // Diffuse luminance extraction
        vec3 diff = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
        float diffLum = dot(diff, vec3(0.2126, 0.7152, 0.0722));

        // 4x4 Bayer screen-space stipple at 5-6 tier transitions
        float bayer = (getBayerValue(gl_FragCoord.xy) / 16.0) - 0.5;
        float numSteps = 5.0; // 6 levels
        float dithered = clamp(diffLum + bayer * (0.85 / numSteps), 0.0, 1.0);
        float qLum = floor(dithered * numSteps + 0.5) / numSteps;

        // Monochrome mapping: Ink-950 (#0F1215) to Bone-100 (#E9E4D8)
        vec3 inkCol = vec3(0.0588, 0.0706, 0.0824);
        vec3 boneCol = vec3(0.9137, 0.8941, 0.8471);
        vec3 lithoBase = mix(inkCol, boneCol, qLum);

        // Boosted sharp PBR specular highlights
        vec3 spec = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
        float specLum = dot(spec, vec3(0.2126, 0.7152, 0.0722));
        float specBoost = smoothstep(0.04, 0.35, specLum);
        vec3 finalCol = mix(lithoBase, vec3(1.0, 1.0, 1.0), specBoost * 0.95);

        gl_FragColor = vec4(finalCol, diffuseColor.a);
      `;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      lithoBody
    );
  };

  mat.customProgramCacheKey = () => (isHeadlight ? "litho_headlight" : "litho_standard");
  mat.needsUpdate = true;
}
