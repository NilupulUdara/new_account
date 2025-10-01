import axios from "axios";

const API_URL = "http://localhost:8000/api/inventory-locations"; 

// Create InventoryLocation
export const createInventoryLocation = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get all InventoryLocations
export const getInventoryLocations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single InventoryLocation by ID
export const getInventoryLocation = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update InventoryLocation
export const updateInventoryLocation = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Delete InventoryLocation
export const deleteInventoryLocation = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
