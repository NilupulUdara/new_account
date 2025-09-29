import axios from "axios";

const API_URL = "http://localhost:8000/api/credit-status-setup"; 

// Create CreditStatusSetup
export const createCreditStatusSetup = async (itemCreditStatusSetupData: any) => {
  try {
    const response = await axios.post(API_URL, itemCreditStatusSetupData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get all CreditStatusSetups
export const getCreditStatusSetups = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get single CreditStatusSetup by ID
export const getCreditStatusSetup = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Update CreditStatusSetup
export const updateCreditStatusSetup = async (id: string | number, itemCreditStatusSetupData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemCreditStatusSetupData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Delete CreditStatusSetup
export const deleteCreditStatusSetup = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
