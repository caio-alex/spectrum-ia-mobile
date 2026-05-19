import { api } from './api';
import type { BrandsResponse, ModelsResponse, TrimsResponse } from '../types/api';

export async function getBrands(query?: string): Promise<string[]> {
  const { data } = await api.get<BrandsResponse>('/vehicles/brands', {
    params: query ? { q: query } : undefined,
  });
  return data.brands;
}

export async function getModels(brand: string, query?: string): Promise<ModelsResponse['models']> {
  const { data } = await api.get<ModelsResponse>('/vehicles/models', {
    params: { brand, ...(query ? { q: query } : {}) },
  });
  return data.models;
}

export async function getTrims(
  brand: string,
  model: string,
  year?: number,
): Promise<string[]> {
  const { data } = await api.get<TrimsResponse>('/vehicles/trims', {
    params: { brand, model, ...(year != null ? { year } : {}) },
  });
  return data.trims;
}
