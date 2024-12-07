import Character from './Character';

interface CharacterDisplayProps {
  level?: number;
  name?: string;
}

export default function CharacterDisplay({ level = 1, name = 'Hero' }: CharacterDisplayProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Character level={level} name={name} />
    </div>
  );
}
