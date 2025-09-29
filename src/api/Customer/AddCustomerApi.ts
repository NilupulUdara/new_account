import axios from "axios";

const API_URL = "http://localhost:8000/api/customers";

export const createCustomer = async (customerData: any) => {
  try {
    const response = await axios.post(API_URL, customerData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getCustomers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};
