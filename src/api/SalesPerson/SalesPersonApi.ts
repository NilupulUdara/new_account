import axios from "axios";

const API_URL = "http://localhost:8000/api/sales-persons"; 

export const createSalesPerson = async (salesPersonData: any) => {
  try {
    const response = await axios.post(API_URL, salesPersonData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getSalesPersons = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getSalesPerson = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateSalesPerson = async (id: string | number, salesPersonData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, salesPersonData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const deleteSalesPerson = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
