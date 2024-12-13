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
  // Terraria-style body proportions (shorter and wider)
  const bodyCore: PixelData[] = [
    // Neck (shorter)
    [11, 10, 1], [12, 10, 1],
    // Torso (wider at shoulders, narrower at waist)
    ...[...Array(5)].flatMap((_, y): PixelData[] => 
      [...Array(8)].map((_, x): PixelData => [x + 8, y + 11, 1])
    ),
    // Arms (shorter)
    ...[...Array(5)].map((_, y): PixelData => [7, y + 11, 1]),
    ...[...Array(5)].map((_, y): PixelData => [16, y + 11, 1]),
    // Hands
    [6, 15, 1], [7, 15, 1],
    [16, 15, 1], [17, 15, 1]
  ];

  // Add shading
  const shadedColor = addShading(skinColor, 30);
  const bodyShading: PixelData[] = [
    // Right side shading
    ...[...Array(5)].map((_, y): PixelData => [15, y + 11, 1]),
    // Bottom shading
    ...[...Array(6)].map((_, x): PixelData => [x + 8, 15, 1])
  ];

  bodyCore.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });

  bodyShading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
  });
};

const drawHead = (
  ctx: CanvasRenderingContext2D,
  skinColor: string,
  eyeColor: string,
  pixelSize: number
) => {
  // Head shape (Terraria style - shorter and wider)
  const headBase: PixelData[] = [
    // Base head shape (10x8)
    ...[...Array(8)].flatMap((_, y): PixelData[] => 
      [...Array(10)].map((_, x): PixelData => [x + 7, y + 2, 1])
    )
  ];

  // Add shading
  const shadedColor = addShading(skinColor, 30);
  const headShading: PixelData[] = [
    // Right side shading
    ...[...Array(8)].map((_, y): PixelData => [15, y + 2, 1]),
    // Bottom shading
    ...[...Array(8)].map((_, x): PixelData => [x + 7, 9, 1])
  ];

  // Draw base and shading
  headBase.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, skinColor, alpha, pixelSize);
  });

  headShading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
  });

  // Eyes (Terraria style - larger and more expressive)
  const eyeBase = getColorHex('white');
  drawPixel(ctx, 9, 5, eyeBase, 1, pixelSize);
  drawPixel(ctx, 10, 5, eyeBase, 1, pixelSize);
  drawPixel(ctx, 13, 5, eyeBase, 1, pixelSize);
  drawPixel(ctx, 14, 5, eyeBase, 1, pixelSize);

  drawPixel(ctx, 9, 6, eyeColor, 1, pixelSize);
  drawPixel(ctx, 10, 6, eyeColor, 1, pixelSize);
  drawPixel(ctx, 13, 6, eyeColor, 1, pixelSize);
  drawPixel(ctx, 14, 6, eyeColor, 1, pixelSize);

  // Eyebrows
  const browColor = addShading(skinColor, 50);
  drawPixel(ctx, 9, 4, browColor, 0.8, pixelSize);
  drawPixel(ctx, 10, 4, browColor, 0.8, pixelSize);
  drawPixel(ctx, 13, 4, browColor, 0.8, pixelSize);
  drawPixel(ctx, 14, 4, browColor, 0.8, pixelSize);

  // Mouth (Terraria style - simple smile)
  const mouthColor = addShading(skinColor, 40);
  drawPixel(ctx, 11, 8, mouthColor, 0.8, pixelSize);
  drawPixel(ctx, 12, 8, mouthColor, 0.8, pixelSize);
  drawPixel(ctx, 13, 8, mouthColor, 0.8, pixelSize);
  drawPixel(ctx, 12, 7, mouthColor, 0.6, pixelSize);
};

const drawHair = (
  ctx: CanvasRenderingContext2D,
  style: string,
  color: string,
  pixelSize: number
) => {
  const hairPixels = getHairPixels(style);
  const shadedColor = addShading(color, 30);

  // Base hair
  hairPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, color, alpha, pixelSize);
  });

  // Shaded parts
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
          [7, 1, 1], [9, 0, 1], [11, 1, 1], [13, 0, 1], [15, 1, 1],
          // Main hair
          [7, 2, 1], [8, 2, 1], [9, 2, 1], [10, 2, 1], [11, 2, 1], [12, 2, 1], [13, 2, 1], [14, 2, 1]
        ],
        shading: [
          // Side spikes shading
          [15, 2, 1], [16, 2, 1],
          [15, 3, 1], [16, 3, 1],
          [15, 4, 0.8], [16, 4, 0.8]
        ]
      };
    case 'ponytail':
      return {
        base: [
          // Top layer
          [7, 2, 1], [8, 2, 1], [9, 2, 1], [10, 2, 1], [11, 2, 1], [12, 2, 1], [13, 2, 1],
          // Ponytail
          [14, 3, 1], [15, 3, 1],
          [15, 4, 1], [16, 4, 1],
          [16, 5, 1], [17, 5, 1]
        ],
        shading: [
          // Ponytail shading
          [16, 3, 0.8], [17, 3, 0.8],
          [17, 4, 0.8], [18, 4, 0.8],
          [18, 5, 0.8], [19, 5, 0.8]
        ]
      };
    default: // short
      return {
        base: [
          // Top layer
          [7, 2, 1], [8, 2, 1], [9, 2, 1], [10, 2, 1], [11, 2, 1], [12, 2, 1], [13, 2, 1],
          // Side layers
          [6, 3, 1], [7, 3, 1], [8, 3, 1]
        ],
        shading: [
          // Side shading
          [14, 2, 0.8], [15, 2, 0.8],
          [14, 3, 0.8], [15, 3, 0.8]
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
  const shadedShirt = addShading(colors.shirt, 30);
  const shadedPants = addShading(colors.pants, 30);
  const shadedShoes = addShading(colors.shoes, 30);

  // Draw base clothing
  const shirtPixels = getShirtPixels(props.shirtStyle);
  shirtPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.shirt, alpha, pixelSize);
  });
  shirtPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedShirt, alpha, pixelSize);
  });

  const pantsPixels = getPantsPixels(props.pantsStyle);
  pantsPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.pants, alpha, pixelSize);
  });
  pantsPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedPants, alpha, pixelSize);
  });

  const shoesPixels = getShoesPixels(props.shoesStyle);
  shoesPixels.base.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, colors.shoes, alpha, pixelSize);
  });
  shoesPixels.shading.forEach(([x, y, alpha = 1]) => {
    drawPixel(ctx, x, y, shadedShoes, alpha, pixelSize);
  });
};

const getShirtPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  const baseShirt: PixelData[] = [
    // Torso
    ...[...Array(5)].flatMap((_, y): PixelData[] => 
      [...Array(6)].map((_, x): PixelData => [x + 9, y + 11, 1])
    ),
    // Sleeves
    ...[...Array(4)].map((_, y): PixelData => [8, y + 11, 1]),
    ...[...Array(4)].map((_, y): PixelData => [15, y + 11, 1])
  ];

  const shading: PixelData[] = [
    // Right side shading
    ...[...Array(5)].map((_, y): PixelData => [14, y + 11, 0.8]),
    // Bottom shading
    ...[...Array(6)].map((_, x): PixelData => [x + 9, 15, 0.8])
  ];

  return { base: baseShirt, shading };
};

const getPantsPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  const basePants: PixelData[] = [
    // Upper legs
    ...[...Array(3)].flatMap((_, y): PixelData[] => [
      [9, y + 16, 1],
      [10, y + 16, 1],
      [13, y + 16, 1],
      [14, y + 16, 1]
    ])
  ];

  const shading: PixelData[] = [
    // Right leg shading
    ...[...Array(3)].map((_, y): PixelData => [13, y + 16, 0.8]),
    // Bottom shading
    [9, 18, 0.8], [10, 18, 0.8], [13, 18, 0.8], [14, 18, 0.8]
  ];

  return { base: basePants, shading };
};

const getShoesPixels = (style: string): { base: PixelData[], shading: PixelData[] } => {
  const baseShoes: PixelData[] = [
    [9, 19, 1], [10, 19, 1], [13, 19, 1], [14, 19, 1],
    [9, 20, 1], [10, 20, 1], [13, 20, 1], [14, 20, 1]
  ];

  const shading: PixelData[] = [
    [13, 19, 0.8], [14, 19, 0.8],
    [13, 20, 0.8], [14, 20, 0.8]
  ];

  return { base: baseShoes, shading };
};

const drawArmor = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  if (props.armorHead) {
    const helmetBase: PixelData[] = [
      ...[...Array(4)].flatMap((_, y): PixelData[] => 
        [...Array(10)].map((_, x): PixelData => [x + 7, y + 2, 0.9])
      )
    ];

    const helmetShading: PixelData[] = [
      ...[...Array(4)].map((_, y): PixelData => [15, y + 2, 0.8]),
      ...[...Array(8)].map((_, x): PixelData => [x + 7, 5, 0.8])
    ];

    const baseColor = '#B8B8B8';
    const shadedColor = addShading(baseColor, 30);

    helmetBase.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });
    helmetShading.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
    });
  }

  if (props.armorBody) {
    const bodyArmorBase: PixelData[] = [
      ...[...Array(5)].flatMap((_, y): PixelData[] => 
        [...Array(8)].map((_, x): PixelData => [x + 8, y + 11, 0.9])
      )
    ];

    const bodyArmorShading: PixelData[] = [
      ...[...Array(5)].map((_, y): PixelData => [14, y + 11, 0.8]),
      ...[...Array(6)].map((_, x): PixelData => [x + 8, 15, 0.8])
    ];

    const baseColor = '#A0A0A0';
    const shadedColor = addShading(baseColor, 30);

    bodyArmorBase.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });
    bodyArmorShading.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
    });

    // Add armor details
    const detailColor = '#C0C0C0';
    drawPixel(ctx, 9, 12, detailColor, 0.9, pixelSize);
    drawPixel(ctx, 13, 12, detailColor, 0.9, pixelSize);
    drawPixel(ctx, 11, 13, detailColor, 0.9, pixelSize);
  }

  if (props.armorLegs) {
    const legArmorBase: PixelData[] = [
      ...[...Array(4)].flatMap((_, y): PixelData[] => [
        [9, y + 16, 0.9],
        [10, y + 16, 0.9],
        [13, y + 16, 0.9],
        [14, y + 16, 0.9]
      ])
    ];

    const legArmorShading: PixelData[] = [
      ...[...Array(4)].map((_, y): PixelData => [13, y + 16, 0.8]),
      [9, 19, 0.8], [10, 19, 0.8], [13, 19, 0.8], [14, 19, 0.8]
    ];

    const baseColor = '#989898';
    const shadedColor = addShading(baseColor, 30);

    legArmorBase.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });
    legArmorShading.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
    });
  }
};

const drawAccessories = (
  ctx: CanvasRenderingContext2D,
  props: CharacterAvatarProps,
  pixelSize: number
) => {
  if (props.accessory1 === 'cape') {
    const capeBase: PixelData[] = [
      ...[...Array(8)].flatMap((_, y): PixelData[] => 
        [...Array(3)].map((_, x): PixelData => [x + 15, y + 11, 0.8])
      )
    ];

    const capeShading: PixelData[] = [
      ...[...Array(8)].map((_, y): PixelData => [17, y + 11, 0.7]),
      ...[...Array(3)].map((_, x): PixelData => [x + 15, 18, 0.7])
    ];

    const baseColor = '#FF0000';
    const shadedColor = addShading(baseColor, 30);

    capeBase.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });
    capeShading.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
    });
  }

  if (props.accessory2 === 'shield') {
    const shieldBase: PixelData[] = [
      ...[...Array(5)].flatMap((_, y): PixelData[] => 
        [...Array(3)].map((_, x): PixelData => [x + 5, y + 12, 0.9])
      )
    ];

    const shieldShading: PixelData[] = [
      ...[...Array(5)].map((_, y): PixelData => [7, y + 12, 0.8]),
      ...[...Array(3)].map((_, x): PixelData => [x + 5, 16, 0.8])
    ];

    const baseColor = '#C0C0C0';
    const shadedColor = addShading(baseColor, 30);
    const detailColor = '#FFD700';

    shieldBase.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, baseColor, alpha, pixelSize);
    });
    shieldShading.forEach(([x, y, alpha = 1]) => {
      drawPixel(ctx, x, y, shadedColor, alpha, pixelSize);
    });

    // Shield emblem
    drawPixel(ctx, 6, 14, detailColor, 0.9, pixelSize);
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
