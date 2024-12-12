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
        container: 'w-24 h-32',
        canvas: 48
      };
    case 'lg':
      return {
        container: 'w-48 h-64',
        canvas: 96
      };
    default: // md
      return {
        container: 'w-32 h-48',
        canvas: 64
      };
  }
};

const colorToRGB = (color: string): [number, number, number] => {
  const colors: Record<string, [number, number, number]> = {
    // Hair colors
    black: [30, 30, 30],
    brown: [139, 69, 19],
    blonde: [255, 215, 0],
    red: [220, 20, 60],
    white: [245, 245, 245],
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
  alpha: number = 1,
  size: number = 1
) => {
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
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

  // Draw body base
  drawBody(ctx, [sr, sg, sb], outfitColors, pixelSize);
  
  // Draw head and face
  drawHead(ctx, [sr, sg, sb], [er, eg, eb], pixelSize);
  
  // Draw hair
  drawHair(ctx, props.hairStyle, [hr, hg, hb], pixelSize);
  
  // Draw outfit details
  drawOutfitDetails(ctx, props.outfit, outfitColors, pixelSize);
};

const drawBody = (
  ctx: CanvasRenderingContext2D,
  skinColor: [number, number, number],
  outfitColors: Record<string, [number, number, number]>,
  pixelSize: number
) => {
  // Torso (wider at shoulders, narrower at waist)
  for (let y = 12; y < 24; y++) {
    const width = Math.max(6, 10 - Math.floor((y - 12) / 2));
    const startX = Math.floor((24 - width) / 2);
    for (let x = startX; x < startX + width; x++) {
      drawPixel(ctx, x, y, outfitColors.primary, 1, pixelSize);
    }
  }

  // Arms
  for (let y = 12; y < 22; y++) {
    // Left arm
    drawPixel(ctx, 6, y, outfitColors.secondary, 1, pixelSize);
    drawPixel(ctx, 5, y, outfitColors.secondary, 1, pixelSize);
    // Right arm
    drawPixel(ctx, 18, y, outfitColors.secondary, 1, pixelSize);
    drawPixel(ctx, 19, y, outfitColors.secondary, 1, pixelSize);
  }

  // Legs
  for (let y = 24; y < 32; y++) {
    // Left leg
    drawPixel(ctx, 9, y, outfitColors.primary, 1, pixelSize);
    drawPixel(ctx, 10, y, outfitColors.primary, 1, pixelSize);
    // Right leg
    drawPixel(ctx, 14, y, outfitColors.primary, 1, pixelSize);
    drawPixel(ctx, 15, y, outfitColors.primary, 1, pixelSize);
  }
};

const drawHead = (
  ctx: CanvasRenderingContext2D,
  skinColor: [number, number, number],
  eyeColor: [number, number, number],
  pixelSize: number
) => {
  // Head shape (slightly oval)
  for (let y = 2; y < 12; y++) {
    const width = 8;
    const startX = 8;
    for (let x = startX; x < startX + width; x++) {
      drawPixel(ctx, x, y, skinColor, 1, pixelSize);
    }
  }

  // Eyes
  drawPixel(ctx, 10, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 11, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 13, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 14, 7, eyeColor, 1, pixelSize);

  // Eyebrows
  drawPixel(ctx, 10, 6, [30, 30, 30], 0.5, pixelSize);
  drawPixel(ctx, 11, 6, [30, 30, 30], 0.5, pixelSize);
  drawPixel(ctx, 13, 6, [30, 30, 30], 0.5, pixelSize);
  drawPixel(ctx, 14, 6, [30, 30, 30], 0.5, pixelSize);

  // Nose
  drawPixel(ctx, 12, 8, skinColor, 0.8, pixelSize);

  // Mouth
  drawPixel(ctx, 11, 9, [180, 100, 100], 0.7, pixelSize);
  drawPixel(ctx, 12, 9, [180, 100, 100], 0.7, pixelSize);
  drawPixel(ctx, 13, 9, [180, 100, 100], 0.7, pixelSize);
};

const drawHair = (
  ctx: CanvasRenderingContext2D,
  style: string,
  hairColor: [number, number, number],
  pixelSize: number
) => {
  const hairPixels = getHairPixels(style);
  hairPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, hairColor, alpha, pixelSize);
  });
};

const getHairPixels = (style: string): [number, number, number?][] => {
  switch (style) {
    case 'spiky':
      return [
        // Base
        [8, 2], [9, 1], [10, 2], [11, 1], [12, 2], [13, 1], [14, 2], [15, 1],
        // Spikes
        [8, 3, 0.9], [9, 2, 0.9], [10, 1, 0.9], [11, 2, 0.9], 
        [12, 1, 0.9], [13, 2, 0.9], [14, 1, 0.9], [15, 2, 0.9],
        // Side spikes
        [7, 4], [8, 3], [16, 4], [15, 3]
      ];
    case 'long':
      return [
        // Top
        [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2],
        // Sides flowing down
        [7, 3], [8, 4], [7, 5], [8, 6], [7, 7], [8, 8],
        [16, 3], [15, 4], [16, 5], [15, 6], [16, 7], [15, 8],
        // Back flowing
        [9, 12], [10, 11], [11, 12], [12, 11], [13, 12], [14, 11]
      ];
    case 'curly':
      return [
        // Top curls
        [8, 2], [9, 1], [10, 2], [11, 1], [12, 2], [13, 1], [14, 2], [15, 1],
        // Side curls
        [7, 3, 0.9], [8, 4, 0.9], [7, 5, 0.9], [8, 6, 0.9],
        [16, 3, 0.9], [15, 4, 0.9], [16, 5, 0.9], [15, 6, 0.9],
        // Back curls
        [9, 3], [11, 3], [13, 3], [15, 3]
      ];
    default: // short
      return [
        // Top layer
        [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2],
        // Side layers
        [7, 3], [8, 3], [15, 3], [16, 3],
        [7, 4], [8, 4], [15, 4], [16, 4]
      ];
  }
};

const getOutfitColors = (outfit: string): Record<string, [number, number, number]> => {
  switch (outfit) {
    case 'warrior':
      return {
        primary: [139, 69, 19],
        secondary: [160, 82, 45],
        accent: [205, 133, 63],
        detail: [218, 165, 32]
      };
    case 'mage':
      return {
        primary: [75, 0, 130],
        secondary: [102, 51, 153],
        accent: [147, 112, 219],
        detail: [218, 165, 32]
      };
    case 'rogue':
      return {
        primary: [47, 79, 79],
        secondary: [61, 94, 94],
        accent: [74, 111, 111],
        detail: [192, 192, 192]
      };
    case 'noble':
      return {
        primary: [128, 0, 32],
        secondary: [139, 0, 0],
        accent: [220, 20, 60],
        detail: [255, 215, 0]
      };
    case 'explorer':
      return {
        primary: [85, 107, 47],
        secondary: [107, 142, 35],
        accent: [154, 205, 50],
        detail: [184, 134, 11]
      };
    default:
      return {
        primary: [105, 105, 105],
        secondary: [128, 128, 128],
        accent: [169, 169, 169],
        detail: [192, 192, 192]
      };
  }
};

const drawOutfitDetails = (
  ctx: CanvasRenderingContext2D,
  outfit: string,
  colors: Record<string, [number, number, number]>,
  pixelSize: number
) => {
  switch (outfit) {
    case 'warrior':
      // Armor plates
      for (let y = 14; y < 20; y += 2) {
        drawPixel(ctx, 9, y, colors.detail, 1, pixelSize);
        drawPixel(ctx, 15, y, colors.detail, 1, pixelSize);
      }
      // Belt
      for (let x = 9; x < 16; x++) {
        drawPixel(ctx, x, 22, colors.detail, 1, pixelSize);
      }
      break;
    case 'mage':
      // Robe patterns
      for (let y = 14; y < 24; y += 2) {
        drawPixel(ctx, 8, y, colors.detail, 0.8, pixelSize);
        drawPixel(ctx, 16, y, colors.detail, 0.8, pixelSize);
      }
      // Magic symbols
      drawPixel(ctx, 12, 16, colors.detail, 1, pixelSize);
      drawPixel(ctx, 12, 17, colors.detail, 1, pixelSize);
      drawPixel(ctx, 11, 17, colors.detail, 1, pixelSize);
      drawPixel(ctx, 13, 17, colors.detail, 1, pixelSize);
      break;
    case 'rogue':
      // Leather straps
      for (let y = 14; y < 22; y += 3) {
        for (let x = 8; x < 17; x++) {
          drawPixel(ctx, x, y, colors.detail, 0.6, pixelSize);
        }
      }
      break;
    // Add more outfit-specific details for other classes
  }
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
      const pixelSize = canvas / 32; // 32x32 grid
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
