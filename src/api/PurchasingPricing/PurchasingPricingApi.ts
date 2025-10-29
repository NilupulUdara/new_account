import axios from "axios";

const API_URL = "http://localhost:8000/api/purchasing-pricings"; // adjust if needed

export interface PurchData {
  supplier_id: number;
  stock_id: string;
  price: number;
  suppliers_uom: string;
  conversion_factor: number;
  supplier_description?: string;
}

/**
 * Get all purchase data
 */
export const getPurchData = async (): Promise<PurchData[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Get a single purchase data record by supplier_id and stock_id
 */
export const getPurchDataById = async (
  supplier_id: number,
  stock_id: string
): Promise<PurchData> => {
  const response = await axios.get(`${API_URL}/${supplier_id}/${stock_id}`);
  return response.data;
};

/**
 * Create a new purchase data record
 */
export const createPurchData = async (data: PurchData): Promise<void> => {
  await axios.post(API_URL, data);
};

/**
 * Update an existing purchase data record
 */
export const updatePurchData = async (
  supplier_id: number,
  stock_id: string,
  data: PurchData
): Promise<void> => {
  await axios.put(`${API_URL}/${supplier_id}/${stock_id}`, data);
};

/**
 * Delete a purchase data record
 */
export const deletePurchData = async (
  supplier_id: number,
  stock_id: string
): Promise<void> => {
  await axios.delete(`${API_URL}/${supplier_id}/${stock_id}`);
};
