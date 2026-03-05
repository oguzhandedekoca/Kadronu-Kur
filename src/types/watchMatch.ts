/** Apple Watch / Realtime DB maç verisi */
export interface WatchMatchGoal {
  minute: number;
  team: string;
  scorer?: string;
}

export interface WatchMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  duration: number;
  goals: WatchMatchGoal[];
}

export type WatchMatchRecord = Record<string, WatchMatch>;
