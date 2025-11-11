// actions/filters.ts
import { API_BASE_URL } from '@/constant/api-url';

export interface Filter {
  id: number;
  name: string;
  created_at: string;
}

export interface FilterValue {
  id: number;
  value: string;
  filter_id: number;
  product_ids: string; // ID товаров через запятую
  created_at: string;
}

// Получение всех фильтров
export async function getFilters(): Promise<Filter[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filters`, {
      next: { revalidate: 900 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching filters:', error);
    return [];
  }
}

// Получение значений фильтра
export async function getFilterValues(filterId: number): Promise<FilterValue[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filter-values?filter_id=${filterId}`, {
      next: { revalidate: 900 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching filter values:', error);
    return [];
  }
}

// Получение всех фильтров со значениями
export async function getFiltersWithValues(): Promise<(Filter & { values: FilterValue[] })[]> {
  try {
    const [filters, allValues] = await Promise.all([
      getFilters(),
      getAllFilterValues()
    ]);

    const filtersWithValues = filters.map(filter => ({
      ...filter,
      values: allValues.filter(value => value.filter_id === filter.id)
    }));

    return filtersWithValues;
  } catch (error) {
    console.error('Error fetching filters with values:', error);
    return [];
  }
}

// Получение всех значений фильтров
export async function getAllFilterValues(): Promise<FilterValue[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filter-values`, {
      next: { revalidate: 900 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all filter values:', error);
    return [];
  }
}

// Получение фильтров для конкретного товара
export async function getFiltersForProduct(productId: number): Promise<(Filter & { values: FilterValue[] })[]> {
  try {
    const allFilters = await getFiltersWithValues();
    
    const productFilters = allFilters.map(filter => ({
      ...filter,
      values: filter.values.filter(value => {
        if (!value.product_ids) return false;
        const productIds = value.product_ids.split(',').map(id => parseInt(id.trim()));
        return productIds.includes(productId);
      })
    })).filter(filter => filter.values.length > 0);

    return productFilters;
  } catch (error) {
    console.error('Error fetching filters for product:', error);
    return [];
  }
}