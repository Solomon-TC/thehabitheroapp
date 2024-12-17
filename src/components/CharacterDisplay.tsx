import type { Character } from '../types/character';

interface CharacterDisplayProps {
  character: Character;
}

export default function CharacterDisplay({ character }: CharacterDisplayProps) {
  return (
    <div className="rpg-panel">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-pixel text-rpg-primary">{character.name}</h2>
        <p className="text-rpg-light">Level {character.level}</p>
      </div>

      <div className="space-y-4">
        {/* Stats */}
        <div>
          <h3 className="text-lg font-pixel text-rpg-light mb-2">Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-rpg-light-darker">Strength</p>
              <div className="rpg-progress-bar">
                <div
                  className="rpg-progress-fill bg-red-500"
                  style={{ width: `${(character.strength / 100) * 100}%` }}
                />
                <span className="rpg-progress-text">{character.strength}</span>
              </div>
            </div>
            <div>
              <p className="text-rpg-light-darker">Agility</p>
              <div className="rpg-progress-bar">
                <div
                  className="rpg-progress-fill bg-green-500"
                  style={{ width: `${(character.agility / 100) * 100}%` }}
                />
                <span className="rpg-progress-text">{character.agility}</span>
              </div>
            </div>
            <div>
              <p className="text-rpg-light-darker">Intelligence</p>
              <div className="rpg-progress-bar">
                <div
                  className="rpg-progress-fill bg-blue-500"
                  style={{ width: `${(character.intelligence / 100) * 100}%` }}
                />
                <span className="rpg-progress-text">{character.intelligence}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-lg font-pixel text-rpg-light mb-2">Experience</h3>
          <div className="rpg-progress-bar">
            <div
              className="rpg-progress-fill bg-yellow-500"
              style={{ width: `${(character.experience / (character.level * 1000)) * 100}%` }}
            />
            <span className="rpg-progress-text">
              {character.experience} / {character.level * 1000}
            </span>
          </div>
        </div>

        {/* Character Appearance */}
        {character.character_appearance && (
          <div>
            <h3 className="text-lg font-pixel text-rpg-light mb-2">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-rpg-light-darker">Hair</p>
                <div
                  className="w-8 h-8 rounded-full border-2 border-rpg-dark"
                  style={{ backgroundColor: character.character_appearance.hair_color }}
                />
              </div>
              <div>
                <p className="text-rpg-light-darker">Eyes</p>
                <div
                  className="w-8 h-8 rounded-full border-2 border-rpg-dark"
                  style={{ backgroundColor: character.character_appearance.eye_color }}
                />
              </div>
              <div>
                <p className="text-rpg-light-darker">Skin</p>
                <div
                  className="w-8 h-8 rounded-full border-2 border-rpg-dark"
                  style={{ backgroundColor: character.character_appearance.skin_color }}
                />
              </div>
              <div>
                <p className="text-rpg-light-darker">Outfit</p>
                <div
                  className="w-8 h-8 rounded-full border-2 border-rpg-dark"
                  style={{ backgroundColor: character.character_appearance.outfit_color }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
