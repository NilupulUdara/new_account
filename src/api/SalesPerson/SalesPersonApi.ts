export interface SalesPerson {
  id: number;
  name: string;
  telephone?: string;
  fax?: string;
  email?: string;
  provision?: number;
  turnover_break_point?: number;
  provision2?: number;
}

import axios from "axios";

const API_URL = "http://localhost:8000/api/sales-persons";

// Create
export const createSalesPerson = async (data: Partial<SalesPerson>): Promise<SalesPerson> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get all
export const getSalesPersons = async (): Promise<SalesPerson[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single
export const getSalesPerson = async (id: string | number): Promise<SalesPerson> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update
export const updateSalesPerson = async (
  id: string | number,
  data: Partial<SalesPerson>
): Promise<SalesPerson> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Delete
export const deleteSalesPerson = async (id: string | number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
