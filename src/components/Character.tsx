interface CharacterProps {
  level?: number;
  name?: string;
}

export default function Character({ level = 1, name = 'Hero' }: CharacterProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{level}</span>
        </div>
        <h2 className="text-xl font-semibold">{name}</h2>
      </div>
    </div>
  );
}
