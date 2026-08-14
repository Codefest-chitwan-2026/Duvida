export type Badge = { id: string; label: string; icon: "medal" | "leaf" | "trophy" | "recycle" };
export type LeaderboardEntry = { id: string; name: string; points: number; rank: number };
export type Transaction = { id: string; label: string; amount: number; date: string };

export const rewardsSummary = {
  totalPoints: 2450,
  xp: 1180,
  level: 12,
  reportsSubmitted: 6,
  issuesVerified: 4,
  questsCompleted: 9,
};

export const badges: Badge[] = [
  { id: "first-report", label: "First Report", icon: "medal" },
  { id: "eco-starter", label: "Eco Starter", icon: "leaf" },
  { id: "quest-streak", label: "5 Quest Streak", icon: "trophy" },
  { id: "recycler", label: "Recycler", icon: "recycle" },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: "1", name: "Aarav S.", points: 4210, rank: 1 },
  { id: "2", name: "Priya K.", points: 3890, rank: 2 },
  { id: "3", name: "You", points: 2450, rank: 3 },
  { id: "4", name: "Rohan D.", points: 2110, rank: 4 },
];

export const transactions: Transaction[] = [
  { id: "t1", label: "Clean the Park quest reward", amount: 150, date: "Aug 12" },
  { id: "t2", label: "Pothole report verified", amount: 60, date: "Aug 9" },
  { id: "t3", label: "Plastic Free Challenge reward", amount: 200, date: "Aug 3" },
  { id: "t4", label: "Water-saving challenge reward", amount: 70, date: "Jul 28" },
];
