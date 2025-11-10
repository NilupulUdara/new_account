import axios from "axios";

// --------------------
// API URL
// --------------------
const API_URL = "http://localhost:8000/api/inventory-locations";

// --------------------
// Interface
// --------------------
export interface InventoryLocation {
  id?: number; // optional for create
  loc_code: string;
  location_name: string;
  delivery_address: string;
  phone: string;
  phone2: string;
  fax: string;
  email: string;
  contact: string;
  inactive?: boolean;
}

// --------------------
// API Functions
// --------------------

// Create
export const createInventoryLocation = async (data: InventoryLocation): Promise<InventoryLocation> => {
  const response = await axios.post<InventoryLocation>(API_URL, data);
  return response.data;
};

// Get all
export const getInventoryLocations = async (): Promise<InventoryLocation[]> => {
  const response = await axios.get<InventoryLocation[]>(API_URL);
  return response.data;
};

// Get single by ID
export const getInventoryLocation = async (id: number): Promise<InventoryLocation> => {
  const response = await axios.get<InventoryLocation>(`${API_URL}/${id}`);
  return response.data;
};

// Update
export const updateInventoryLocation = async (id: number, data: InventoryLocation): Promise<InventoryLocation> => {
  const response = await axios.put<InventoryLocation>(`${API_URL}/${id}`, data);
  return response.data;
};

// Delete
export const deleteInventoryLocation = async (id: number): Promise<{ success: boolean }> => {
  const response = await axios.delete<{ success: boolean }>(`${API_URL}/${id}`);
  return response.data;
};
