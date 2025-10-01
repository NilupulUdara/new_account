import axios from "axios";

const API_URL = "http://localhost:8000/api/customers";

// ✅ Create
export const createCustomer = async (customerData: any) => {
  try {
    const response = await axios.post(API_URL, customerData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get all customers
export const getCustomers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Get single customer by ID
export const getCustomer = async (id: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Update customer
export const updateCustomer = async (id: string | number, customerData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, customerData);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ✅ Delete customer
export const deleteCustomer = async (id: string | number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getCustomerContacts = async (customerId: string | number) => {
  try {
    const response = await axios.get(`${API_URL}/${customerId}`);
    return response.data.contacts || [];
  } catch (error: any) {
    console.error("Failed to fetch contacts:", error.response || error);
    return [];
  }
};