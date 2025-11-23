import { httpClient } from './httpClient';

export interface TrainerStatsResponse {
  total_public_trainers: number;
}

export interface TrainerFiltersResponse {
  cities: string[];
}

export const getTrainerStats = async (): Promise<TrainerStatsResponse> => {
  const response = await httpClient.get<TrainerStatsResponse>('/api/trainers/stats');

  return response.data;
};

export const getTrainerFilters = async (): Promise<TrainerFiltersResponse> => {
  const response = await httpClient.get<TrainerFiltersResponse>('/api/trainers/filters');

  return response.data;
};
