export type Quest = {
  id: string;
  title: string;
  description: string;
  tokens: number;
  participants: number;
  progressPercent: number;
  location: string;
  icon: "delete" | "leaf" | "water" | "trophy";
};

export const mockQuests: Quest[] = [
  {
    id: "clean-the-park",
    title: "Clean the Park",
    description: "Help keep our community park clean and green.",
    tokens: 150,
    participants: 87,
    progressPercent: 64,
    location: "NMC Park, Kathmandu",
    icon: "delete",
  },
  {
    id: "plastic-free",
    title: "Plastic Free Challenge",
    description: "Go a full week without single-use plastic.",
    tokens: 200,
    participants: 43,
    progressPercent: 28,
    location: "Citywide",
    icon: "trophy",
  },
];

export function getQuestById(id: string | undefined): Quest | undefined {
  return mockQuests.find((quest) => quest.id === id);
}
