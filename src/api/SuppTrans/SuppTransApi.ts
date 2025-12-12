import axios from "axios";

const API_URL = "http://localhost:8000/api/supp-trans";

export const getSuppTrans = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier transactions:", error);
    return [];
  }
};

export const getSuppTranById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier transaction ${id}:`, error);
    return null;
  }
};

export const createSuppTrans = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data; // returns created record
  } catch (error: any) {
    console.error(
      "Error creating supplier transaction:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateSuppTrans = async (id: string | number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating supplier transaction ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteSuppTrans = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting supplier transaction ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
