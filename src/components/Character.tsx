import type { Character as CharacterType } from '../types';

interface CharacterProps {
  character: CharacterType;
  animate?: boolean;
}

export default function Character({ character, animate = true }: CharacterProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
      {/* Character Avatar */}
      <div 
        className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold ${animate ? 'animate-bounce' : ''}`}
        style={{ backgroundColor: character.appearance.color }}
      >
        {character.name[0].toUpperCase()}
      </div>

      {/* Level indicator */}
      <div className="text-lg font-semibold mb-2">
        Level {character.level}
      </div>

      {/* Character Name */}
      <div className="text-xl font-bold mb-2">
        {character.name}
      </div>

      {/* Accessories */}
      {character.appearance.accessories.length > 0 && (
        <div className="flex gap-2 mt-2">
          {character.appearance.accessories.map((accessory, index) => (
            <div 
              key={index}
              className="px-2 py-1 bg-gray-100 rounded-md text-sm"
            >
              {accessory}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
