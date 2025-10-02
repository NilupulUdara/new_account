import axios from "axios";

const API_URL = "http://localhost:8000/api/shipping-companies";

// Create Shipping Company
export const createShippingCompany = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get all Shipping Companies
export const getShippingCompanies = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single Shipping Company by ID
export const getShippingCompany = async (shipper_id: number) => {
  const response = await axios.get(`${API_URL}/${shipper_id}`);
  return response.data;
};

// Update Shipping Company
export const updateShippingCompany = async (shipper_id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${shipper_id}`, data);
  return response.data;
};

// Delete Shipping Company
export const deleteShippingCompany = async (shipper_id: number) => {
  const response = await axios.delete(`${API_URL}/${shipper_id}`);
  return response.data;
};
