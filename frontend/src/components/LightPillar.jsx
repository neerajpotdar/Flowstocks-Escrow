import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LightPillar = ({
    topColor = "#5227FF",
    bottomColor = "#FF9FFC",
    intensity = 1.0,
    rotationSpeed = 0.3,
    glowAmount = 0.005,
    pillarWidth = 3.0,
    pillarHeight = 0.4, // This seems small in logic, likely scale
    noiseIntensity = 0.5,
    pillarRotation = 0,
    interactive = false,
    mixBlendMode = "normal"
}) => {
    const mesh = useRef();

    // Vertex Shader
    const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float iTime;
    uniform float rotationSpeed;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Rotate the cylinder
      float angle = iTime * rotationSpeed;
      mat3 rotMatrix = mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
      );
      
      vec3 pos = position;
      // Slightly bulge or modifying can be done here
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

    // Fragment Shader
    const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float intensity;
    uniform float iTime;
    uniform float noiseIntensity;
    
    // Simple noise function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      // Vertical gradient
      vec3 color = mix(bottomColor, topColor, vUv.y);
      
      // Horizontal fade (edges)
      float horizontalFade = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 2.0);
      
      // Vertical fade (top/bottom)
      float verticalFade = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 4.0);
      
      // Noise effect
      float noise = random(vUv + iTime * 0.1) * noiseIntensity;
      
      // Pulse effect
      float pulse = (sin(iTime * 2.0) * 0.5 + 0.5) * 0.2 + 0.8;
      
      float alpha = horizontalFade * verticalFade * intensity * pulse;
      alpha += noise * 0.1;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

    const uniforms = useMemo(
        () => ({
            iTime: { value: 0 },
            topColor: { value: new THREE.Color(topColor) },
            bottomColor: { value: new THREE.Color(bottomColor) },
            intensity: { value: intensity },
            rotationSpeed: { value: rotationSpeed },
            noiseIntensity: { value: noiseIntensity }
        }),
        [topColor, bottomColor, intensity, rotationSpeed, noiseIntensity]
    );

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.material.uniforms.iTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh
            ref={mesh}
            rotation={[0, pillarRotation, 0]}
            position={[0, 0, 0]}
            scale={[pillarWidth, pillarHeight * 20, pillarWidth]} // Scaling height as user passed 0.4
        >
            <cylinderGeometry args={[1, 1, 1, 32, 1, true]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

export default LightPillar;
