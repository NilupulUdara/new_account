import axios from "axios";

// Set your backend URL
const API_URL = "http://localhost:8000/api/loc-stocks";

export interface LocStock {
  loc_code: string;
  stock_id: string;
  reorder_level: number;
  created_at?: string;
  updated_at?: string;
}

//  Get all loc_stock records
export const getLocStocks = async (): Promise<LocStock[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

//  Get a single record by loc_code + stock_id
export const getLocStockById = async (loc_code: string, stock_id: string): Promise<LocStock> => {
  const response = await axios.get(`${API_URL}/${loc_code}/${stock_id}`);
  return response.data;
};

//  Create new record
export const createLocStock = async (data: LocStock): Promise<LocStock> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

//  Update existing record
export const updateLocStock = async (
  loc_code: string,
  stock_id: string,
  data: Partial<LocStock>
): Promise<LocStock> => {
  const response = await axios.put(`${API_URL}/${loc_code}/${stock_id}`, data);
  return response.data;
};

//  Delete record
export const deleteLocStock = async (loc_code: string, stock_id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${loc_code}/${stock_id}`);
};
