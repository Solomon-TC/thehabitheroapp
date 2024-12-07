import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
  position?: [number, number, number];
  level?: number;
  name?: string;
}

export default function Character({ position = [0, 0, 0], level = 1, name = 'Hero' }: CharacterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Character body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>

      {/* Level display */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`Level ${level}`}
      </Text>

      {/* Character name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}
