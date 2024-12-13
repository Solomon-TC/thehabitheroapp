import React, { useEffect, useRef } from 'react';
import { getColorHex } from '../types/character';

interface CharacterAvatarProps {
  hairStyle: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  shirtStyle: string;
  shirtColor: string;
  pantsStyle: string;
  pantsColor: string;
  shoesStyle: string;
  shoesColor: string;
  armorHead?: string;
  armorBody?: string;
  armorLegs?: string;
  accessory1?: string;
  accessory2?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type PixelData = [number, number, number?];

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

const drawPixel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number = 1,
  size: number = 1
) => {
  ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
  ctx.fillRect(x * size, y * size, size, size);
};

const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw base character in Terraria style
  drawTerrariaCharacter(ctx, props, pixelSize);
};

const drawTerrariaCharacter = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  const {
    skinColor,
    hairColor,
    eyeColor,
    shirtColor,
    pantsColor,
    shoesColor
  } = props;

  // Convert colors to hex
  const skinHex = getColorHex(skinColor);
  const hairHex = getColorHex(hairColor);
  const eyeHex = getColorHex(eyeColor);
  const shirtHex = getColorHex(shirtColor);
  const pantsHex = getColorHex(pantsColor);
  const shoesHex = getColorHex(shoesColor);

  // Draw in layers from back to front
  drawBody(ctx, skinHex, pixelSize);
  drawClothing(ctx, props, {
    shirt: shirtHex,
    pants: pantsHex,
    shoes: shoesHex
  }, pixelSize);
  drawHead(ctx, skinHex, eyeHex, pixelSize);
  drawHair(ctx, props.hairStyle, hairHex, pixelSize);
  
  // Draw armor if equipped
  if (props.armorBody) drawArmor(ctx, props, pixelSize);
  
  // Draw accessories
  drawAccessories(ctx, props, pixelSize);
};

const drawBody = (
  ctx: CanvasRenderingContext2D,
  skinColor: string,
  pixelSize: number
) => {
  // Terraria-style body proportions
  const bodyCore: PixelData[] = [
    // Neck
    [11, 11, 1], [12, 11, 1],
    // Torso (wider at shoulders, narrower at waist)
    ...[...Array(6)].flatMap((_, y): PixelData[] => 
      [...Array(8)].map((_, x): PixelData => [x + 8, y + 12, 1])
    ),
    // Arms
    ...[...Array(6)].map((_, y): PixelData => [7, y + 12, 1]),
    ...[...Array(6)].map((_, y): PixelData => [16, y + 12, 1]),
    // Hands
    [6, 17, 1], [7, 17, 1],
    [16, 17, 1], [17, 17, 1]
  ];

  bodyCore.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });
};

const drawClothing = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  colors: { shirt: string; pants: string; shoes: string },
  pixelSize: number
) => {
  // Draw shirt based on style
  const shirtPixels = getShirtPixels(props.shirtStyle);
  shirtPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.shirt, alpha, pixelSize);
  });

  // Draw pants based on style
  const pantsPixels = getPantsPixels(props.pantsStyle);
  pantsPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.pants, alpha, pixelSize);
  });

  // Draw shoes based on style
  const shoesPixels = getShoesPixels(props.shoesStyle);
  shoesPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.shoes, alpha, pixelSize);
  });
};

const getShirtPixels = (style: string): PixelData[] => {
  // Base shirt pixels (Terraria-style)
  const baseShirt: PixelData[] = [
    // Torso
    ...[...Array(5)].flatMap((_, y): PixelData[] => 
      [...Array(6)].map((_, x): PixelData => [x + 9, y + 12, 1])
    ),
    // Sleeves
    ...[...Array(4)].map((_, y): PixelData => [8, y + 12, 1]),
    ...[...Array(4)].map((_, y): PixelData => [15, y + 12, 1])
  ];

  // Add style-specific details
  switch (style) {
    case 'collared':
      return [
        ...baseShirt,
        // Collar
        [9, 11, 0.9], [10, 11, 0.9], [13, 11, 0.9], [14, 11, 0.9]
      ];
    case 'vest':
      return [
        ...baseShirt,
        // Vest details
        [10, 13, 0.9], [11, 13, 0.9], [12, 13, 0.9], [13, 13, 0.9]
      ];
    default:
      return baseShirt;
  }
};

const getPantsPixels = (style: string): PixelData[] => {
  const basePants: PixelData[] = [
    // Upper legs
    ...[...Array(3)].flatMap((_, y): PixelData[] => [
      [10, y + 17, 1],
      [11, y + 17, 1],
      [12, y + 17, 1],
      [13, y + 17, 1]
    ])
  ];

  switch (style) {
    case 'shorts':
      return basePants;
    case 'skirt':
      return [
        ...basePants,
        // Skirt flare
        [9, 17, 1], [14, 17, 1],
        [8, 18, 1], [15, 18, 1]
      ];
    default:
      return [
        ...basePants,
        // Lower legs
        ...[...Array(3)].flatMap((_, y): PixelData[] => [
          [10, y + 20, 1],
          [11, y + 20, 1],
          [12, y + 20, 1],
          [13, y + 20, 1]
        ])
      ];
  }
};

const getShoesPixels = (style: string): PixelData[] => {
  const baseShoes: PixelData[] = [
    [10, 23, 1], [11, 23, 1], [12, 23, 1], [13, 23, 1],
    [10, 24, 1], [11, 24, 1], [12, 24, 1], [13, 24, 1]
  ];

  switch (style) {
    case 'boots':
      return [
        ...baseShoes,
        [9, 23, 1], [14, 23, 1],
        [9, 24, 1], [14, 24, 1]
      ];
    case 'armored':
      return [
        ...baseShoes,
        [9, 23, 0.9], [14, 23, 0.9],
        [9, 24, 0.9], [14, 24, 0.9]
      ];
    default:
      return baseShoes;
  }
};

const drawHead = (
  ctx: CanvasRenderingContext2D,
  skinColor: string,
  eyeColor: string,
  pixelSize: number
) => {
  // Head shape (more oval)
  const headPixels: PixelData[] = [
    // Base head shape
    ...[...Array(8)].flatMap((_, y): PixelData[] => 
      [...Array(8)].map((_, x): PixelData => [x + 8, y + 3, 1])
    ),
    // Neck
    [11, 11, 1], [12, 11, 1]
  ];

  headPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });

  // Eyes
  drawPixel(ctx, 10, 6, eyeColor, 1, pixelSize);
  drawPixel(ctx, 11, 6, eyeColor, 1, pixelSize);
  drawPixel(ctx, 13, 6, eyeColor, 1, pixelSize);
  drawPixel(ctx, 14, 6, eyeColor, 1, pixelSize);

  // Eyebrows
  drawPixel(ctx, 10, 5, '#000000', 0.7, pixelSize);
  drawPixel(ctx, 11, 5, '#000000', 0.7, pixelSize);
  drawPixel(ctx, 13, 5, '#000000', 0.7, pixelSize);
  drawPixel(ctx, 14, 5, '#000000', 0.7, pixelSize);

  // Nose
  drawPixel(ctx, 12, 7, skinColor, 0.8, pixelSize);
  drawPixel(ctx, 12, 8, skinColor, 0.8, pixelSize);

  // Mouth
  drawPixel(ctx, 11, 9, '#FF9999', 0.7, pixelSize);
  drawPixel(ctx, 12, 9, '#FF9999', 0.7, pixelSize);
  drawPixel(ctx, 13, 9, '#FF9999', 0.7, pixelSize);
};

const drawHair = (
  ctx: CanvasRenderingContext2D,
  style: string,
  color: string,
  pixelSize: number
) => {
  const hairPixels = getHairPixels(style);
  hairPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, color, alpha, pixelSize);
  });
};

const getHairPixels = (style: string): PixelData[] => {
  switch (style) {
    case 'hero':
      return [
        // Top layer
        [8, 2, 1], [9, 2, 1], [10, 2, 1], [11, 2, 1], [12, 2, 1], [13, 2, 1], [14, 2, 1],
        // Side layers
        [7, 3, 1], [8, 3, 1], [14, 3, 1], [15, 3, 1],
        [7, 4, 1], [15, 4, 1],
        // Back spikes
        [8, 5, 0.9], [10, 5, 0.9], [12, 5, 0.9], [14, 5, 0.9]
      ];
    case 'ponytail':
      return [
        // Top layer
        [8, 2, 1], [9, 2, 1], [10, 2, 1], [11, 2, 1], [12, 2, 1], [13, 2, 1], [14, 2, 1],
        // Ponytail
        [14, 3, 1], [15, 3, 1],
        [15, 4, 1], [16, 4, 1],
        [16, 5, 1], [17, 5, 1],
        [17, 6, 1], [18, 6, 1],
        [18, 7, 1], [19, 7, 1]
      ];
    case 'messy':
      return [
        // Top spikes
        [7, 2, 1], [9, 1, 1], [11, 2, 1], [13, 1, 1], [15, 2, 1],
        // Side layers
        [6, 3, 1], [7, 3, 1], [15, 3, 1], [16, 3, 1],
        [6, 4, 1], [16, 4, 1],
        // Random spikes
        [8, 5, 0.8], [11, 5, 0.8], [14, 5, 0.8]
      ];
    default: // short
      return [
        // Top layer
        [8, 2, 1], [9, 2, 1], [10, 2, 1], [11, 2, 1], [12, 2, 1], [13, 2, 1], [14, 2, 1],
        // Side layers
        [7, 3, 1], [8, 3, 1], [14, 3, 1], [15, 3, 1],
        [7, 4, 1], [15, 4, 1]
      ];
  }
};

const drawArmor = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  if (props.armorHead) {
    const helmetPixels: PixelData[] = [
      ...[...Array(4)].flatMap((_, y): PixelData[] => 
        [...Array(10)].map((_, x): PixelData => [x + 7, y + 2, 0.9])
      )
    ];
    helmetPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#A0A0A0', alpha, pixelSize);
    });
  }

  if (props.armorBody) {
    const bodyArmorPixels: PixelData[] = [
      ...[...Array(6)].flatMap((_, y): PixelData[] => 
        [...Array(10)].map((_, x): PixelData => [x + 7, y + 12, 0.9])
      )
    ];
    bodyArmorPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#B8B8B8', alpha, pixelSize);
    });
  }

  if (props.armorLegs) {
    const legArmorPixels: PixelData[] = [
      ...[...Array(7)].flatMap((_, y): PixelData[] => 
        [...Array(6)].map((_, x): PixelData => [x + 9, y + 18, 0.9])
      )
    ];
    legArmorPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#A8A8A8', alpha, pixelSize);
    });
  }
};

const drawAccessories = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  if (props.accessory1 === 'cape') {
    const capePixels: PixelData[] = [
      ...[...Array(8)].flatMap((_, y): PixelData[] => 
        [...Array(3)].map((_, x): PixelData => [x + 16, y + 12, 0.8])
      )
    ];
    capePixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#FF0000', alpha, pixelSize);
    });
  }

  if (props.accessory2 === 'shield') {
    const shieldPixels: PixelData[] = [
      ...[...Array(5)].flatMap((_, y): PixelData[] => 
        [...Array(3)].map((_, x): PixelData => [x + 5, y + 13, 0.9])
      )
    ];
    shieldPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#C0C0C0', alpha, pixelSize);
    });
  }
};

export default function CharacterAvatar({
  hairStyle,
  hairColor,
  skinColor,
  eyeColor,
  shirtStyle,
  shirtColor,
  pantsStyle,
  pantsColor,
  shoesStyle,
  shoesColor,
  armorHead,
  armorBody,
  armorLegs,
  accessory1,
  accessory2,
  size = 'md',
  className = ''
}: CharacterAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { container, canvas } = getSizeClasses(size);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const pixelSize = canvas / 32; // 32x32 grid
      drawCharacter(ctx, {
        hairStyle,
        hairColor,
        skinColor,
        eyeColor,
        shirtStyle,
        shirtColor,
        pantsStyle,
        pantsColor,
        shoesStyle,
        shoesColor,
        armorHead,
        armorBody,
        armorLegs,
        accessory1,
        accessory2
      }, pixelSize);
    }
  }, [
    hairStyle, hairColor, skinColor, eyeColor,
    shirtStyle, shirtColor, pantsStyle, pantsColor,
    shoesStyle, shoesColor, armorHead, armorBody,
    armorLegs, accessory1, accessory2, canvas
  ]);

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
