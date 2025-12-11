import axios from "axios";

const API_URL = "http://localhost:8000/api/grn-batch";

export const getGrnBatches = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching GRN batches:", error);
    return [];
  }
};

export const getGrnBatchById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching GRN batch ${id}:`, error);
    return null;
  }
};

export const createGrnBatch = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data; // returns created GRN batch
  } catch (error: any) {
    console.error(
      "Error creating GRN batch:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateGrnBatch = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating GRN batch ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteGrnBatch = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting GRN batch ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
