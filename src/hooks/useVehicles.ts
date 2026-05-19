import { useQuery } from '@tanstack/react-query';
import { getBrands, getModels, getTrims } from '../services/vehicles';

export function useBrands() {
  return useQuery({
    queryKey: ['vehicles', 'brands'],
    queryFn: () => getBrands(),
    staleTime: 1000 * 60 * 60,
  });
}

export function useModels(brand: string | null | undefined) {
  return useQuery({
    queryKey: ['vehicles', 'models', brand],
    queryFn: () => getModels(brand as string),
    enabled: !!brand,
    staleTime: 1000 * 60 * 30,
  });
}

export function useTrims(
  brand: string | null | undefined,
  model: string | null | undefined,
  year: number | null | undefined,
) {
  return useQuery({
    queryKey: ['vehicles', 'trims', brand, model, year],
    queryFn: () => getTrims(brand as string, model as string, year ?? undefined),
    enabled: !!brand && !!model && year != null,
    staleTime: 1000 * 60 * 30,
  });
}
