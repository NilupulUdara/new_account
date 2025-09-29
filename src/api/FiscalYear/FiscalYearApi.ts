import axios from "axios";

const API_URL = "http://localhost:8000/api/fiscal-years";

export const createFiscalYear = async (fiscalYearData: any) => {
  try {
    const response = await axios.post(API_URL, fiscalYearData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getFiscalYears = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getFiscalYear = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateFiscalYear = async (id: string, fiscalYearData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, fiscalYearData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteFiscalYear = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
 
}; 
