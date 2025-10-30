import axios from "axios";

const API_URL = "http://localhost:8000/api/stock-masters";

export const getItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

export const getItemById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return null;
  }
};

export const createItem = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating item:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateItem = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating item ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteItem = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting item ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};
