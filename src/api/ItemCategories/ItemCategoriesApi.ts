import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/item-categories";

// Create a new Item Category
export const createItemCategory = async (data: any) => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating item category:", error.response || error);
    throw error;
  }
};

// Get all Item Categories (optionally filtered)
export const getItemCategories = async (includeInactive = false) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching item categories:", error.response || error);
    throw error;
  }
};

// Get a single Item Category by ID
export const getItemCategoryById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching item category:", error.response || error);
    throw error;
  }
};

// Update Item Category
export const updateItemCategory = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating item category:", error.response || error);
    throw error;
  }
};

// Delete Item Category
export const deleteItemCategory = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting item category:", error.response || error);
    throw error;
  }
};
