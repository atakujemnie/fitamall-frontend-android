import { httpClient } from './httpClient';

export interface TrainerStatsResponse {
  total_public_trainers: number;
}

export interface TrainerFiltersResponse {
  cities: string[];
}

export interface TrainerListItem {
  id?: string;
  first_name: string;
  last_name: string;
  city: string;
}

export const getTrainerStats = async (): Promise<TrainerStatsResponse> => {
  const response = await httpClient.get<TrainerStatsResponse>('/api/trainers/stats');

  return response.data;
};

export const getTrainerCities = async (): Promise<string[]> => {
  const response = await httpClient.get<TrainerFiltersResponse>('/api/trainers/filters');

  return response.data.cities;
};

export const getTrainersByCity = async (city: string): Promise<TrainerListItem[]> => {
  const response = await httpClient.get<TrainerListItem[]>('/api/trainers', {
    params: { city },
  });

  return response.data;
};
