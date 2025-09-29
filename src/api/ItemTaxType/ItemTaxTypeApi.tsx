import axios from "axios";

const API_URL = "http://localhost:8000/api/item-tax-types"; 

// Create ItemTaxType
export const createItemTaxType = async (itemTaxTypeData: any) => {
  try {
    const response = await axios.post(API_URL, itemTaxTypeData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get all ItemTaxTypes
export const getItemTaxTypes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get single ItemTaxType by ID
export const getItemTaxType = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Update ItemTaxType
export const updateItemTaxType = async (id: string | number, itemTaxTypeData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemTaxTypeData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Delete ItemTaxType
export const deleteItemTaxType = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
