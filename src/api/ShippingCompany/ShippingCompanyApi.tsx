import axios from "axios";

const API_URL = "http://localhost:8000/api/shipping-companies";

export interface ShippingCompany {
  shipper_id?: number; // optional for create
  shipper_name: string;
  phone: string;
  phone2: string;
  contact: string;
  address: string;
}

// Create
export const createShippingCompany = async (data: ShippingCompany): Promise<ShippingCompany> => {
  const response = await axios.post<ShippingCompany>(API_URL, data);
  return response.data;
};

// Get all
export const getShippingCompanies = async (): Promise<ShippingCompany[]> => {
  const response = await axios.get<ShippingCompany[]>(API_URL);
  return response.data;
};

// Get single by ID
export const getShippingCompany = async (shipper_id: number): Promise<ShippingCompany> => {
  const response = await axios.get<ShippingCompany>(`${API_URL}/${shipper_id}`);
  return response.data;
};

// Update
export const updateShippingCompany = async (shipper_id: number, data: ShippingCompany): Promise<ShippingCompany> => {
  const response = await axios.put<ShippingCompany>(`${API_URL}/${shipper_id}`, data);
  return response.data;
};

// Delete
export const deleteShippingCompany = async (shipper_id: number): Promise<{ success: boolean }> => {
  const response = await axios.delete<{ success: boolean }>(`${API_URL}/${shipper_id}`);
  return response.data;
};
