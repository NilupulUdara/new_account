import axios from "axios";

const API_URL = "http://localhost:8000/api/trans-types";

export const getTransTypes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching trans types:", error);
    return [];
  }
};

export const getTransTypeById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trans type ${id}:`, error);
    return null;
  }
};

export const createTransType = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating trans type:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateTransType = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating trans type ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteTransType = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting trans type ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};
