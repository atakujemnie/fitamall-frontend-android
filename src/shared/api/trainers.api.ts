import { httpClient } from './httpClient';

export interface TrainerStatsResponse {
  total_public_trainers: number;
}

export const getTrainerStats = async (): Promise<TrainerStatsResponse> => {
  const response = await httpClient.get<TrainerStatsResponse>('/api/trainers/stats');

  return response.data;
};
