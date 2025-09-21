// hooks/useCityPath.ts
export const useCityPath = (city?: string | null) => {
  return city ? `/${city}` : '';
};