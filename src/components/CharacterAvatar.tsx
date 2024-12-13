import React, { useEffect, useRef } from 'react';
import { getColorHex } from '../types/character';

export interface CharacterAvatarProps {
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

const drawOutline = (
  ctx: CanvasRenderingContext2D,
  pixels: PixelData[],
  color: string,
  pixelSize: number
) => {
  const outline: PixelData[] = [];
  pixels.forEach(([x, y]) => {
    // Check adjacent pixels
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (!pixels.some(([px, py]) => px === newX && py === newY)) {
        outline.push([newX, newY, 1]);
      }
    });
  });
  
  outline.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, color, alpha * 0.5, pixelSize);
  });
};

const addShading = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
  // Terraria-style body (shorter and wider)
  const bodyPixels: PixelData[] = [
    // Torso (wider)
    ...[...Array(4)].flatMap((_, y): PixelData[] => 
      [...Array(8)].map((_, x): PixelData => [x + 8, y + 10, 1])
    ),
    // Arms (shorter)
    ...[...Array(4)].map((_, y): PixelData => [7, y + 10, 1]),
    ...[...Array(4)].map((_, y): PixelData => [16, y + 10, 1]),
    // Hands
    [6, 13, 1], [7, 13, 1],
    [16, 13, 1], [17, 13, 1]
  ];

  // Draw outline first
  drawOutline(ctx, bodyPixels, '#000000', pixelSize);

  // Draw base color
  bodyPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });

  // Add shading
  const shadedColor = addShading(skinColor, 30);
  const shadingPixels: PixelData[] = [
    // Right side shading
    ...[...Array(4)].map((_, y): PixelData => [15, y + 10, 0.8]),
    // Bottom shading
    ...[...Array(8)].map((_, x): PixelData => [x + 8, 13, 0.8])
  ];

  shadingPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
  });
};

const drawHead = (
  ctx: CanvasRenderingContext2D,
  skinColor: string,
  eyeColor: string,
  pixelSize: number
) => {
  // Terraria-style head (shorter and wider)
  const headPixels: PixelData[] = [
    // Base head shape (8x6)
    ...[...Array(6)].flatMap((_, y): PixelData[] => 
      [...Array(8)].map((_, x): PixelData => [x + 8, y + 4, 1])
    )
  ];

  // Draw outline
  drawOutline(ctx, headPixels, '#000000', pixelSize);

  // Draw base color
  headPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });

  // Add shading
  const shadedColor = addShading(skinColor, 30);
  const shadingPixels: PixelData[] = [
    // Right side shading
    ...[...Array(6)].map((_, y): PixelData => [14, y + 4, 0.8]),
    // Bottom shading
    ...[...Array(8)].map((_, x): PixelData => [x + 8, 9, 0.8])
  ];

  shadingPixels.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
  });

  // Eyes (Terraria style)
  const eyeBase = '#FFFFFF';
  drawPixel(ctx, 9, 6, eyeBase, 1, pixelSize);
  drawPixel(ctx, 10, 6, eyeBase, 1, pixelSize);
  drawPixel(ctx, 13, 6, eyeBase, 1, pixelSize);
  drawPixel(ctx, 14, 6, eyeBase, 1, pixelSize);

  drawPixel(ctx, 9, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 10, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 13, 7, eyeColor, 1, pixelSize);
  drawPixel(ctx, 14, 7, eyeColor, 1, pixelSize);

  // Mouth (Terraria style - simple line)
  drawPixel(ctx, 11, 8, '#000000', 0.5, pixelSize);
  drawPixel(ctx, 12, 8, '#000000', 0.5, pixelSize);
};

const drawHair = (
  ctx: CanvasRenderingContext2D,
  style: string,
  color: string,
  pixelSize: number
) => {
  const hairPixels = getHairPixels(style);

  // Draw outline
  drawOutline(ctx, hairPixels.base, '#000000', pixelSize);

  // Draw base hair
  hairPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, color, alpha, pixelSize);
  });

  // Draw shading
  const shadedColor = addShading(color, 30);
  hairPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
  });
};

const getHairPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  switch (style) {
    case 'hero':
      return {
        base: [
          // Top spikes
          [7, 3, 1], [9, 2, 1], [11, 3, 1], [13, 2, 1], [15, 3, 1],
          // Main hair
          [7, 4, 1], [8, 4, 1], [9, 4, 1], [10, 4, 1], [11, 4, 1], [12, 4, 1], [13, 4, 1], [14, 4, 1]
        ],
        shading: [
          // Side spikes shading
          [15, 4, 0.8], [16, 4, 0.8],
          [15, 5, 0.8], [16, 5, 0.8]
        ]
      };
    case 'ponytail':
      return {
        base: [
          // Top layer
          [7, 4, 1], [8, 4, 1], [9, 4, 1], [10, 4, 1], [11, 4, 1], [12, 4, 1], [13, 4, 1],
          // Ponytail
          [14, 5, 1], [15, 5, 1],
          [15, 6, 1], [16, 6, 1],
          [16, 7, 1], [17, 7, 1]
        ],
        shading: [
          // Ponytail shading
          [16, 5, 0.8], [17, 5, 0.8],
          [17, 6, 0.8], [18, 6, 0.8]
        ]
      };
    default: // short
      return {
        base: [
          // Top layer
          [7, 4, 1], [8, 4, 1], [9, 4, 1], [10, 4, 1], [11, 4, 1], [12, 4, 1], [13, 4, 1],
          // Side layers
          [6, 5, 1], [7, 5, 1], [8, 5, 1]
        ],
        shading: [
          // Side shading
          [14, 4, 0.8], [15, 4, 0.8],
          [14, 5, 0.8], [15, 5, 0.8]
        ]
      };
  }
};

const drawClothing = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  colors: { shirt: string; pants: string; shoes: string },
  pixelSize: number
) => {
  // Draw shirt
  const shirtPixels = getShirtPixels(props.shirtStyle);
  drawOutline(ctx, shirtPixels.base, '#000000', pixelSize);
  shirtPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.shirt, alpha, pixelSize);
  });
  const shadedShirt = addShading(colors.shirt, 30);
  shirtPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedShirt, alpha, pixelSize);
  });

  // Draw pants
  const pantsPixels = getPantsPixels(props.pantsStyle);
  drawOutline(ctx, pantsPixels.base, '#000000', pixelSize);
  pantsPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.pants, alpha, pixelSize);
  });
  const shadedPants = addShading(colors.pants, 30);
  pantsPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedPants, alpha, pixelSize);
  });

  // Draw shoes
  const shoesPixels = getShoesPixels(props.shoesStyle);
  drawOutline(ctx, shoesPixels.base, '#000000', pixelSize);
  shoesPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.shoes, alpha, pixelSize);
  });
  const shadedShoes = addShading(colors.shoes, 30);
  shoesPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedShoes, alpha, pixelSize);
  });
};

const getShirtPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  const baseShirt: PixelData[] = [
    // Torso (Terraria style - shorter)
    ...[...Array(4)].flatMap((_, y): PixelData[] => 
      [...Array(6)].map((_, x): PixelData => [x + 9, y + 10, 1])
    ),
    // Sleeves
    ...[...Array(3)].map((_, y): PixelData => [8, y + 10, 1]),
    ...[...Array(3)].map((_, y): PixelData => [15, y + 10, 1])
  ];

  const shading: PixelData[] = [
    // Right side shading
    ...[...Array(4)].map((_, y): PixelData => [14, y + 10, 0.8]),
    // Bottom shading
    ...[...Array(6)].map((_, x): PixelData => [x + 9, 13, 0.8])
  ];

  return { base: baseShirt, shading };
};

const getPantsPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  const basePants: PixelData[] = [
    // Legs (Terraria style - shorter)
    ...[...Array(3)].flatMap((_, y): PixelData[] => [
      [9, y + 14, 1],
      [10, y + 14, 1],
      [13, y + 14, 1],
      [14, y + 14, 1]
    ])
  ];

  const shading: PixelData[] = [
    // Right leg shading
    ...[...Array(3)].map((_, y): PixelData => [13, y + 14, 0.8]),
    // Bottom shading
    [9, 16, 0.8], [10, 16, 0.8], [13, 16, 0.8], [14, 16, 0.8]
  ];

  return { base: basePants, shading };
};

const getShoesPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  const baseShoes: PixelData[] = [
    [9, 17, 1], [10, 17, 1], [13, 17, 1], [14, 17, 1],
    [9, 18, 1], [10, 18, 1], [13, 18, 1], [14, 18, 1]
  ];

  const shading: PixelData[] = [
    [13, 17, 0.8], [14, 17, 0.8],
    [13, 18, 0.8], [14, 18, 0.8]
  ];

  return { base: baseShoes, shading };
};

const drawArmor = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  if (props.armorHead) {
    const helmetPixels: PixelData[] = [
      ...[...Array(3)].flatMap((_, y): PixelData[] => 
        [...Array(8)].map((_, x): PixelData => [x + 8, y + 4, 0.9])
      )
    ];

    drawOutline(ctx, helmetPixels, '#000000', pixelSize);

    const baseColor = '#B8B8B8';
    const shadedColor = addShading(baseColor, 30);

    helmetPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });

    // Helmet details
    drawPixel(ctx, 9, 5, shadedColor, 0.8, pixelSize);
    drawPixel(ctx, 14, 5, shadedColor, 0.8, pixelSize);
  }

  if (props.armorBody) {
    const armorPixels: PixelData[] = [
      ...[...Array(4)].flatMap((_, y): PixelData[] => 
        [...Array(8)].map((_, x): PixelData => [x + 8, y + 10, 0.9])
      )
    ];

    drawOutline(ctx, armorPixels, '#000000', pixelSize);

    const baseColor = '#A0A0A0';
    const shadedColor = addShading(baseColor, 30);
    const highlightColor = '#C0C0C0';

    armorPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });

    // Armor details
    drawPixel(ctx, 9, 11, highlightColor, 0.9, pixelSize);
    drawPixel(ctx, 14, 11, highlightColor, 0.9, pixelSize);
    drawPixel(ctx, 11, 12, shadedColor, 0.8, pixelSize);
  }

  if (props.armorLegs) {
    const legsPixels: PixelData[] = [
      ...[...Array(3)].flatMap((_, y): PixelData[] => [
        [9, y + 14, 0.9],
        [10, y + 14, 0.9],
        [13, y + 14, 0.9],
        [14, y + 14, 0.9]
      ])
    ];

    drawOutline(ctx, legsPixels, '#000000', pixelSize);

    const baseColor = '#989898';
    const shadedColor = addShading(baseColor, 30);

    legsPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });

    // Leg armor details
    drawPixel(ctx, 9, 15, shadedColor, 0.8, pixelSize);
    drawPixel(ctx, 14, 15, shadedColor, 0.8, pixelSize);
  }
};

const drawAccessories = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  if (props.accessory1 === 'cape') {
    const capePixels: PixelData[] = [
      ...[...Array(6)].flatMap((_, y): PixelData[] => 
        [...Array(3)].map((_, x): PixelData => [x + 15, y + 10, 0.8])
      )
    ];

    drawOutline(ctx, capePixels, '#000000', pixelSize);

    const baseColor = '#FF0000';
    const shadedColor = addShading(baseColor, 30);

    capePixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });

    // Cape details
    drawPixel(ctx, 17, 11, shadedColor, 0.8, pixelSize);
    drawPixel(ctx, 17, 13, shadedColor, 0.8, pixelSize);
    drawPixel(ctx, 17, 15, shadedColor, 0.8, pixelSize);
  }

  if (props.accessory2 === 'shield') {
    const shieldPixels: PixelData[] = [
      ...[...Array(4)].flatMap((_, y): PixelData[] => 
        [...Array(3)].map((_, x): PixelData => [x + 5, y + 11, 0.9])
      )
    ];

    drawOutline(ctx, shieldPixels, '#000000', pixelSize);

    const baseColor = '#C0C0C0';
    const shadedColor = addShading(baseColor, 30);
    const detailColor = '#FFD700';

    shieldPixels.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });

    // Shield details
    drawPixel(ctx, 6, 12, detailColor, 0.9, pixelSize);
    drawPixel(ctx, 6, 13, shadedColor, 0.8, pixelSize);
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
