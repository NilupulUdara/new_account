import axios from "axios";

const API_URL = "http://localhost:8000/api/credit-status-setup";

// Interface for CreditStatusSetup
export interface CreditStatusSetup {
  id?: number; 
  reason_description: string;
  disallow_invoices: boolean;
  // backend accepts numeric 1/0 for inactive; allow boolean or number in types
  inactive?: boolean | number;
}

// Create CreditStatusSetup
export const createCreditStatusSetup = async (data: CreditStatusSetup) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get all CreditStatusSetups
export const getCreditStatusSetups = async (): Promise<CreditStatusSetup[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Get single CreditStatusSetup by ID
export const getCreditStatusSetup = async (id: number): Promise<CreditStatusSetup> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Update CreditStatusSetup
export const updateCreditStatusSetup = async (id: number, data: CreditStatusSetup) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Delete CreditStatusSetup
export const deleteCreditStatusSetup = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
