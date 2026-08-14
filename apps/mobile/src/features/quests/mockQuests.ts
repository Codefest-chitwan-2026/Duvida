export type QuestCategory = "community" | "personal";
export type QuestStatus = "active" | "completed" | "expired";
export type QuestIcon =
  | "delete"
  | "leaf"
  | "water"
  | "trophy"
  | "bus"
  | "walk"
  | "lightning-bolt"
  | "recycle";

export type Quest = {
  id: string;
  title: string;
  description: string;
  tokens: number;
  xp: number;
  participants: number;
  progressPercent: number;
  location: string;
  icon: QuestIcon;
  category: QuestCategory;
  status: QuestStatus;
  steps: string[];
  safetyNote?: string;
  /** Set on quests generated from the AI Sustainability Advisor flow. */
  aiSuggested?: boolean;
};

export const mockQuests: Quest[] = [
  {
    id: "clean-the-park",
    title: "Clean the Park",
    description: "Help keep our community park clean and green.",
    tokens: 150,
    xp: 80,
    participants: 87,
    progressPercent: 64,
    location: "NMC Park, Kathmandu",
    icon: "delete",
    category: "community",
    status: "active",
    steps: [
      "Head to NMC Park during the scheduled cleanup window.",
      "Collect litter into the provided bags — gloves recommended.",
      "Sort recyclables from general waste at the collection point.",
      "Submit a before/after photo as proof.",
    ],
    safetyNote: "Avoid handling broken glass or sharp debris directly — use gloves or tools.",
  },
  {
    id: "plastic-free",
    title: "Plastic Free Challenge",
    description: "Go a full week without single-use plastic.",
    tokens: 200,
    xp: 120,
    participants: 43,
    progressPercent: 28,
    location: "Citywide",
    icon: "trophy",
    category: "community",
    status: "active",
    steps: [
      "Swap single-use plastic bags/bottles for reusable ones.",
      "Track each plastic-free day in your notes.",
      "Submit a proof photo of your reusable setup at the end of the week.",
    ],
  },
  {
    id: "walk-short-journey",
    title: "Walk a Short Journey",
    description: "Skip the ride for a trip under 2km and walk instead.",
    tokens: 40,
    xp: 25,
    participants: 12,
    progressPercent: 0,
    location: "Anywhere nearby",
    icon: "walk",
    category: "personal",
    status: "active",
    steps: ["Pick a nearby errand or trip under 2km.", "Walk instead of driving or riding.", "Submit a photo at your destination as proof."],
    aiSuggested: true,
  },
  {
    id: "public-transport-day",
    title: "Use Public Transport",
    description: "Take the bus or a shared ride instead of a private vehicle today.",
    tokens: 50,
    xp: 30,
    participants: 21,
    progressPercent: 0,
    location: "Anywhere nearby",
    icon: "bus",
    category: "personal",
    status: "active",
    steps: ["Plan a trip you'd normally drive.", "Take public or shared transport instead.", "Submit a photo (ticket or transit stop) as proof."],
    aiSuggested: true,
  },
  {
    id: "low-carbon-travel-day",
    title: "Complete a Low-Carbon Travel Day",
    description: "Go a full day using only walking, cycling, or public transport.",
    tokens: 90,
    xp: 55,
    participants: 9,
    progressPercent: 0,
    location: "Citywide",
    icon: "leaf",
    category: "personal",
    status: "active",
    steps: [
      "Avoid private vehicle trips for the whole day.",
      "Use walking, cycling, or public transport only.",
      "Submit a short note or photo summarizing your day.",
    ],
    aiSuggested: true,
  },
  {
    id: "separate-recyclables",
    title: "Separate Recyclable Waste",
    description: "Sort your household waste into recyclables and general waste for a week.",
    tokens: 60,
    xp: 35,
    participants: 34,
    progressPercent: 0,
    location: "At home",
    icon: "recycle",
    category: "personal",
    status: "active",
    steps: ["Set up separate bins for recyclables and general waste.", "Sort waste correctly for 7 days.", "Submit a photo of your sorted bins."],
    aiSuggested: true,
  },
  {
    id: "reduce-electricity",
    title: "Reduce Unnecessary Electricity Usage",
    description: "Cut down standby power and unused lighting for a week.",
    tokens: 60,
    xp: 35,
    participants: 18,
    progressPercent: 0,
    location: "At home",
    icon: "lightning-bolt",
    category: "personal",
    status: "active",
    steps: ["Switch off lights/appliances when not in use.", "Unplug standby devices overnight.", "Submit a note on what you changed."],
    aiSuggested: true,
  },
  {
    id: "water-saving-challenge",
    title: "Complete a Water-Saving Challenge",
    description: "Cut your household water use with shorter showers and fixed leaks.",
    tokens: 70,
    xp: 40,
    participants: 15,
    progressPercent: 0,
    location: "At home",
    icon: "water",
    category: "personal",
    status: "active",
    steps: ["Time your showers and aim to shorten them.", "Check taps/pipes for leaks and report/fix any found.", "Submit a photo or note summarizing your changes."],
    aiSuggested: true,
  },
];

export function getQuestById(id: string | undefined): Quest | undefined {
  return mockQuests.find((quest) => quest.id === id);
}

export function getAiSuggestedQuests(): Quest[] {
  return mockQuests.filter((quest) => quest.aiSuggested);
}
