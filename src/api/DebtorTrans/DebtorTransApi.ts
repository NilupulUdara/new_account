import axios from "axios";

const API_URL = "http://localhost:8000/api/debtor-trans";

export const getDebtorTrans = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching debtor transactions:", error);
    return [];
  }
};

export const getDebtorTranById = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching debtor transaction ${id}:`, error);
    return null;
  }
};

export const createDebtorTran = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating debtor transaction:", error.response?.data || error.message || error);
    console.log("Full error:", error);
    throw error.response?.data || error;
  }
};

export const updateDebtorTran = async (id: string | number, data: any) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating debtor transaction ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteDebtorTran = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting debtor transaction ${id}:`, error.response?.data || error);
    throw error.response?.data || error;
  }
};
