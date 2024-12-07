import { supabase } from '../lib/supabase';
import type { 
  Character, 
  CharacterLevelUp, 
  AttributeType, 
  CoreAttributeType
} from '../types';
import { CORE_ATTRIBUTES } from '../types';

const EXPERIENCE_PER_LEVEL = 100;
const ATTRIBUTE_INCREASE_CHANCE = 0.7; // 70% chance to increase an attribute on level up

type AttributeIncreases = Partial<Record<AttributeType, number>>;

interface ProgressionResult {
  levelUp: CharacterLevelUp | null;
  newAchievements: string[];
  attributeIncreases: AttributeIncreases;
  streakMilestone: number | null;
}

export async function calculateCharacterProgression(
  characterId: string,
  experienceGained: number,
  attributeType: AttributeType,
  isCustomAttribute: boolean = false
): Promise<ProgressionResult> {
  try {
    // Fetch current character data
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) throw error;
    if (!character) throw new Error('Character not found');

    const currentCharacter = character as Character;
    const newExperience = currentCharacter.experience + experienceGained;
    const newLevel = Math.floor(newExperience / EXPERIENCE_PER_LEVEL) + 1;
    const leveledUp = newLevel > currentCharacter.level;

    let attributeIncreases: AttributeIncreases = {};
    let unlockedAccessories: string[] = [];
    let unlockedAchievements: string[] = [];
    let streakMilestone: number | null = null;

    // Calculate attribute increases
    if (leveledUp && Math.random() < ATTRIBUTE_INCREASE_CHANCE) {
      attributeIncreases = {
        [attributeType]: 1
      };
    }

    // Check for new accessories based on level
    if (leveledUp) {
      if (newLevel % 5 === 0) {
        unlockedAccessories.push(`level_${newLevel}_accessory`);
      }
      if (newLevel % 10 === 0) {
        unlockedAchievements.push(`Reached Level ${newLevel}!`);
      }
    }

    // Check for attribute-based achievements
    const currentAttributeValue = isCustomAttribute
      ? currentCharacter.custom_attributes[attributeType] || 0
      : currentCharacter.attributes[attributeType as CoreAttributeType];
    
    const newAttributeValue = currentAttributeValue + (attributeIncreases[attributeType] || 0);

    if (newAttributeValue >= 5 && !currentCharacter.appearance.achievements.includes(`${attributeType} Adept`)) {
      unlockedAchievements.push(`${attributeType} Adept`);
    }
    if (newAttributeValue >= 10 && !currentCharacter.appearance.achievements.includes(`${attributeType} Master`)) {
      unlockedAchievements.push(`${attributeType} Master`);
    }

    // Check for streak milestones
    const habit = await supabase
      .from('habits')
      .select('current_streak')
      .eq('id', characterId)
      .single();

    if (habit?.data?.current_streak) {
      const streak = habit.data.current_streak;
      if (streak === 7) {
        streakMilestone = 7;
        unlockedAchievements.push('Week Warrior');
      } else if (streak === 30) {
        streakMilestone = 30;
        unlockedAchievements.push('Monthly Master');
      } else if (streak === 100) {
        streakMilestone = 100;
        unlockedAchievements.push('Century Champion');
      }
    }

    // Update character in database
    const updateData: Partial<Character> = {
      level: newLevel,
      experience: newExperience,
      appearance: {
        ...currentCharacter.appearance,
        accessories: [...currentCharacter.appearance.accessories, ...unlockedAccessories],
        achievements: [...currentCharacter.appearance.achievements, ...unlockedAchievements]
      }
    };

    // Update appropriate attribute type
    if (isCustomAttribute) {
      updateData.custom_attributes = {
        ...currentCharacter.custom_attributes,
        [attributeType]: newAttributeValue
      };
    } else {
      updateData.attributes = {
        ...currentCharacter.attributes,
        [attributeType]: newAttributeValue
      };
    }

    const { error: updateError } = await supabase
      .from('characters')
      .update(updateData)
      .eq('id', characterId);

    if (updateError) throw updateError;

    return {
      levelUp: leveledUp ? {
        newLevel,
        attributeIncreases,
        unlockedAccessories: unlockedAccessories.length > 0 ? unlockedAccessories : undefined,
        unlockedAchievements: unlockedAchievements.length > 0 ? unlockedAchievements : undefined
      } : null,
      newAchievements: unlockedAchievements,
      attributeIncreases,
      streakMilestone
    };
  } catch (error) {
    console.error('Error calculating character progression:', error);
    throw error;
  }
}

export function getProgressionMessages(result: ProgressionResult): string[] {
  const messages: string[] = [];

  if (result.levelUp) {
    messages.push(`Congratulations! You've reached level ${result.levelUp.newLevel}!`);
  }

  if (Object.entries(result.attributeIncreases).length > 0) {
    Object.entries(result.attributeIncreases).forEach(([attr, increase]) => {
      const attributeName = CORE_ATTRIBUTES[attr as CoreAttributeType]?.name || attr;
      messages.push(`${attributeName} increased by ${increase}!`);
    });
  }

  result.newAchievements.forEach(achievement => {
    messages.push(`Achievement Unlocked: ${achievement}!`);
  });

  if (result.streakMilestone) {
    messages.push(`Amazing! You've maintained a ${result.streakMilestone}-day streak!`);
  }

  return messages;
}

export function getAttributeColor(attributeType: AttributeType, isCustom: boolean = false): string {
  if (!isCustom && attributeType in CORE_ATTRIBUTES) {
    return CORE_ATTRIBUTES[attributeType as CoreAttributeType].color;
  }
  // Generate a consistent color for custom attributes
  const hash = Array.from(attributeType).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

export function getAttributeIcon(attributeType: AttributeType, isCustom: boolean = false): string {
  if (!isCustom && attributeType in CORE_ATTRIBUTES) {
    return CORE_ATTRIBUTES[attributeType as CoreAttributeType].icon;
  }
  return '⭐'; // Default icon for custom attributes
}
