import axios from "axios";

const API_URL = "http://localhost:8000/api/recurrent-invoices";

// Create Recurrent Invoice
export const createRecurrentInvoice = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Get all Recurrent Invoices
export const getRecurrentInvoices = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single Recurrent Invoice by ID
export const getRecurrentInvoice = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Update Recurrent Invoice
export const updateRecurrentInvoice = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Delete Recurrent Invoice
export const deleteRecurrentInvoice = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
