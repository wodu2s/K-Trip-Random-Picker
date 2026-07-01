export interface Review {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  date: string;
  destinationId: string;
}

export type AppState = 'landing' | 'picking' | 'result';
