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

  // Draw body (Terraria proportions - shorter and more compact)
  drawBody(ctx, skinHex, pixelSize);
  
  // Draw clothing layers
  drawClothing(ctx, props, {
    shirt: shirtHex,
    pants: pantsHex,
    shoes: shoesHex
  }, pixelSize);
  
  // Draw head and face
  drawHead(ctx, skinHex, eyeHex, pixelSize);
  
  // Draw hair
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
  // Terraria-style body proportions (20x30 pixels)
  const bodyPixels: PixelData[] = [
    // Torso core
    ...[...Array(8)].flatMap((_, y) => 
      [...Array(6)].map((_, x): PixelData => [x + 7, y + 12, 1])
    ),
    // Arms
    ...[...Array(10)].map((_, y): PixelData => [5, y + 12, 1]),
    ...[...Array(10)].map((_, y): PixelData => [14, y + 12, 1])
  ];

  bodyPixels.forEach(([x, y, alpha = 1]) => {
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
    [7, 12, 1], [8, 12, 1], [9, 12, 1], [10, 12, 1], [11, 12, 1], [12, 12, 1],
    [7, 13, 1], [8, 13, 1], [9, 13, 1], [10, 13, 1], [11, 13, 1], [12, 13, 1],
    [7, 14, 1], [8, 14, 1], [9, 14, 1], [10, 14, 1], [11, 14, 1], [12, 14, 1],
    [7, 15, 1], [8, 15, 1], [9, 15, 1], [10, 15, 1], [11, 15, 1], [12, 15, 1],
    // Sleeves
    [6, 12, 1], [6, 13, 1], [6, 14, 1],
    [13, 12, 1], [13, 13, 1], [13, 14, 1]
  ];

  // Add style-specific details
  switch (style) {
    case 'collared':
      return [
        ...baseShirt,
        // Collar details
        [7, 11, 0.8], [8, 11, 0.8], [11, 11, 0.8], [12, 11, 0.8]
      ];
    case 'vest':
      return [
        ...baseShirt,
        // Vest details
        [8, 13, 0.8], [9, 13, 0.8], [10, 13, 0.8], [11, 13, 0.8]
      ];
    default:
      return baseShirt;
  }
};

const getPantsPixels = (style: string): PixelData[] => {
  // Base pants pixels (Terraria-style)
  const basePants: PixelData[] = [
    [8, 16, 1], [9, 16, 1], [10, 16, 1], [11, 16, 1],
    [8, 17, 1], [9, 17, 1], [10, 17, 1], [11, 17, 1],
    [8, 18, 1], [9, 18, 1], [10, 18, 1], [11, 18, 1],
    [8, 19, 1], [9, 19, 1], [10, 19, 1], [11, 19, 1]
  ];

  switch (style) {
    case 'shorts':
      return basePants.filter(([_, y]) => y <= 17);
    case 'skirt':
      return [
        ...basePants,
        [7, 16, 1], [12, 16, 1],
        [7, 17, 1], [12, 17, 1]
      ];
    default:
      return basePants;
  }
};

const getShoesPixels = (style: string): PixelData[] => {
  // Base shoes pixels (Terraria-style)
  const baseShoes: PixelData[] = [
    [8, 20, 1], [9, 20, 1], [10, 20, 1], [11, 20, 1],
    [8, 21, 1], [9, 21, 1], [10, 21, 1], [11, 21, 1]
  ];

  switch (style) {
    case 'boots':
      return [
        ...baseShoes,
        [7, 20, 1], [12, 20, 1],
        [7, 21, 1], [12, 21, 1]
      ];
    case 'armored':
      return [
        ...baseShoes,
        [7, 20, 0.8], [12, 20, 0.8],
        [7, 21, 0.8], [12, 21, 0.8]
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
  // Terraria-style head (more square)
  const headPixels: PixelData[] = [
    ...[...Array(8)].flatMap((_, y) => 
      [...Array(6)].map((_, x): PixelData => [x + 7, y + 4, 1])
    )
  ];

  headPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });

  // Eyes (Terraria-style)
  drawPixel(ctx, 8, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 11, 7, eyeColor, 1, pixelSize);

  // Simple mouth
  drawPixel(ctx, 9, 9, '#000000', 0.5, pixelSize);
  drawPixel(ctx, 10, 9, '#000000', 0.5, pixelSize);
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
        [7, 3, 1], [8, 3, 1], [9, 3, 1], [10, 3, 1], [11, 3, 1], [12, 3, 1],
        [7, 4, 1], [12, 4, 1],
        [6, 5, 1], [13, 5, 1]
      ];
    case 'ponytail':
      return [
        [7, 3, 1], [8, 3, 1], [9, 3, 1], [10, 3, 1], [11, 3, 1],
        [12, 3, 1], [12, 4, 1], [12, 5, 1], [12, 6, 1], [12, 7, 1]
      ];
    case 'messy':
      return [
        [6, 3, 1], [7, 2, 1], [8, 3, 1], [9, 2, 1], [10, 3, 1], [11, 2, 1], [12, 3, 1],
        [13, 4, 1], [6, 4, 1], [7, 5, 1]
      ];
    default: // short
      return [
        [7, 3, 1], [8, 3, 1], [9, 3, 1], [10, 3, 1], [11, 3, 1], [12, 3, 1],
        [7, 4, 1], [8, 4, 1], [11, 4, 1], [12, 4, 1]
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
      ...[...Array(4)].flatMap((_, y) => 
        [...Array(8)].map((_, x): PixelData => [x + 6, y + 3, 0.9])
      )
    ];
    helmetPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#A0A0A0', alpha, pixelSize);
    });
  }

  if (props.armorBody) {
    const bodyArmorPixels: PixelData[] = [
      ...[...Array(4)].flatMap((_, y) => 
        [...Array(8)].map((_, x): PixelData => [x + 6, y + 12, 0.9])
      )
    ];
    bodyArmorPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#B8B8B8', alpha, pixelSize);
    });
  }

  if (props.armorLegs) {
    const legArmorPixels: PixelData[] = [
      ...[...Array(4)].flatMap((_, y) => 
        [...Array(6)].map((_, x): PixelData => [x + 7, y + 16, 0.9])
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
      ...[...Array(6)].flatMap((_, y) => 
        [...Array(2)].map((_, x): PixelData => [x + 14, y + 12, 0.8])
      )
    ];
    capePixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, '#FF0000', alpha, pixelSize);
    });
  }

  if (props.accessory2 === 'shield') {
    const shieldPixels: PixelData[] = [
      ...[...Array(4)].flatMap((_, y) => 
        [...Array(2)].map((_, x): PixelData => [x + 4, y + 13, 0.9])
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
