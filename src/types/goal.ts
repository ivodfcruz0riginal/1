export type GoalTimeframe = 'ShortTerm' | 'MediumTerm' | 'LongTerm';

export type GoalCategory =
  | 'Economy'
  | 'Animals'
  | 'Genetics'
  | 'Prestige'
  | 'Buildings'
  | 'Bullfights'
  | 'Legacy';

export type GoalDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Legendary';

export type RewardType = 'Money' | 'Prestige' | 'Unlock' | 'SpecialEvent';

export interface GoalReward {
  type: RewardType;
  value: number;
  description: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  category: GoalCategory;
  difficulty: GoalDifficulty;
  progress: number;
  completed: boolean;
  completedDate?: { month: string; year: number };
  reward: GoalReward;
}
