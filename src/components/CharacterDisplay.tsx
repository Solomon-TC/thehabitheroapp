import { Canvas } from '@react-three/fiber';
import Character from './Character';

interface CharacterDisplayProps {
  level?: number;
  name?: string;
}

export default function CharacterDisplay({ level = 1, name = 'Hero' }: CharacterDisplayProps) {
  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: '#1a1a1a' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Character position={[0, 0, 0]} level={level} name={name} />
      </Canvas>
    </div>
  );
}
