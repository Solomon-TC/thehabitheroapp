import React, { useEffect, useRef } from 'react';

interface CharacterAvatarProps {
  hairStyle: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  outfit: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'w-24 h-24',
        canvas: 32
      };
    case 'lg':
      return {
        container: 'w-48 h-48',
        canvas: 64
      };
    default: // md
      return {
        container: 'w-32 h-32',
        canvas: 48
      };
  }
};

const colorToRGB = (color: string): [number, number, number] => {
  const colors: Record<string, [number, number, number]> = {
    // Hair colors
    black: [0, 0, 0],
    brown: [139, 69, 19],
    blonde: [255, 215, 0],
    red: [220, 20, 60],
    white: [255, 255, 255],
    blue: [65, 105, 225],
    purple: [128, 0, 128],
    green: [34, 139, 34],
    // Skin colors
    fair: [255, 228, 196],
    light: [245, 222, 179],
    medium: [222, 184, 135],
    dark: [210, 105, 30],
    deep: [139, 69, 19],
    // Eye colors
    hazel: [218, 165, 32],
    gray: [128, 128, 128],
    amber: [255, 165, 0],
    violet: [238, 130, 238]
  };
  return colors[color] || [0, 0, 0];
};

const drawPixel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: [number, number, number],
  size: number = 1
) => {
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.fillRect(x * size, y * size, size, size);
};

const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  const [hr, hg, hb] = colorToRGB(props.hairColor);
  const [sr, sg, sb] = colorToRGB(props.skinColor);
  const [er, eg, eb] = colorToRGB(props.eyeColor);
  const outfitColors = getOutfitColors(props.outfit);

  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw base head
  for (let y = 4; y < 12; y++) {
    for (let x = 4; x < 12; x++) {
      drawPixel(ctx, x, y, [sr, sg, sb], pixelSize);
    }
  }

  // Draw hair based on style
  const hairPixels = getHairPixels(props.hairStyle);
  hairPixels.forEach(([x, y]) => {
    drawPixel(ctx, x, y, [hr, hg, hb], pixelSize);
  });

  // Draw eyes
  drawPixel(ctx, 6, 7, [er, eg, eb], pixelSize);
  drawPixel(ctx, 9, 7, [er, eg, eb], pixelSize);

  // Draw mouth
  drawPixel(ctx, 7, 9, [0, 0, 0], pixelSize);
  drawPixel(ctx, 8, 9, [0, 0, 0], pixelSize);

  // Draw body/outfit
  drawOutfit(ctx, outfitColors, pixelSize);
};

const getHairPixels = (style: string): [number, number][] => {
  switch (style) {
    case 'spiky':
      return [
        [4, 2], [5, 1], [6, 2], [7, 1], [8, 2], [9, 1], [10, 2],
        [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3]
      ];
    case 'long':
      return [
        [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2],
        [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3],
        [4, 4], [10, 4], [4, 5], [10, 5], [4, 6], [10, 6]
      ];
    case 'curly':
      return [
        [4, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 2],
        [4, 3], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 3],
        [4, 4], [10, 4]
      ];
    default: // short
      return [
        [4, 3], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 3],
        [4, 4], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 4]
      ];
  }
};

const getOutfitColors = (outfit: string): Record<string, [number, number, number]> => {
  switch (outfit) {
    case 'warrior':
      return {
        primary: [139, 69, 19],
        secondary: [160, 82, 45],
        accent: [205, 133, 63]
      };
    case 'mage':
      return {
        primary: [75, 0, 130],
        secondary: [102, 51, 153],
        accent: [147, 112, 219]
      };
    case 'rogue':
      return {
        primary: [47, 79, 79],
        secondary: [61, 94, 94],
        accent: [74, 111, 111]
      };
    default:
      return {
        primary: [105, 105, 105],
        secondary: [128, 128, 128],
        accent: [169, 169, 169]
      };
  }
};

const drawOutfit = (
  ctx: CanvasRenderingContext2D,
  colors: Record<string, [number, number, number]>,
  pixelSize: number
) => {
  // Draw body
  for (let y = 12; y < 16; y++) {
    for (let x = 5; x < 11; x++) {
      drawPixel(ctx, x, y, colors.primary, pixelSize);
    }
  }

  // Draw arms
  for (let y = 12; y < 15; y++) {
    drawPixel(ctx, 4, y, colors.secondary, pixelSize);
    drawPixel(ctx, 11, y, colors.secondary, pixelSize);
  }

  // Draw legs
  for (let y = 16; y < 19; y++) {
    drawPixel(ctx, 6, y, colors.primary, pixelSize);
    drawPixel(ctx, 9, y, colors.primary, pixelSize);
  }

  // Draw outfit details
  drawPixel(ctx, 7, 13, colors.accent, pixelSize);
  drawPixel(ctx, 8, 13, colors.accent, pixelSize);
};

export default function CharacterAvatar({
  hairStyle,
  hairColor,
  skinColor,
  eyeColor,
  outfit,
  size = 'md',
  className = ''
}: CharacterAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { container, canvas } = getSizeClasses(size);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const pixelSize = canvas / 24; // 24x24 grid
      drawCharacter(ctx, { hairStyle, hairColor, skinColor, eyeColor, outfit }, pixelSize);
    }
  }, [hairStyle, hairColor, skinColor, eyeColor, outfit, canvas]);

  return (
    <div className={`relative ${container} ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvas}
        height={canvas}
        className="w-full h-full pixelated"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
