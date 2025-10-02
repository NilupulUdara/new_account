import axios from "axios";

const API_URL = "http://localhost:8000/api/payment-terms";

// Create Payment Term
export const createPaymentTerm = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get all Payment Terms
export const getPaymentTerms = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single Payment Term by ID
export const getPaymentTerm = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update Payment Term
export const updatePaymentTerm = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Delete Payment Term
export const deletePaymentTerm = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
