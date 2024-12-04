import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Character as CharacterType } from '../types';

interface CharacterProps {
  character: CharacterType;
  animate?: boolean;
}

export default function Character({ character, animate = true }: CharacterProps) {
  const group = useRef<THREE.Group>(null);

  // Basic animation
  useFrame((state) => {
    if (animate && group.current) {
      // Gentle floating animation
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      // Subtle rotation
      group.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={character.appearance.color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={character.appearance.color} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.15, 1.1, 0.3]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.15, 1.1, 0.3]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pupils */}
      <mesh position={[0.15, 1.1, 0.38]}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.15, 1.1, 0.38]}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Level indicator */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`Level ${character.level}`}
      </Text>

      {/* Accessories */}
      {character.appearance.accessories.map((accessory, index) => (
        <AccessoryItem key={index} type={accessory} position={[0, 0, 0]} />
      ))}
    </group>
  );
}

interface AccessoryProps {
  type: string;
  position: [number, number, number];
}

function AccessoryItem({ type, position }: AccessoryProps) {
  // Add different accessory types here (hats, weapons, etc.)
  return null;
}
