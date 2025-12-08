import axios from "axios";

const API_URL = "http://localhost:8000/api/invoice-identifications";

// GET all Invoice Identifications
export const getInvoiceIdentifications = async () => {
  return await axios.get(API_URL);
};

// GET single Invoice Identification by ID
export const getInvoiceIdentification = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// CREATE new Invoice Identification
export const createInvoiceIdentification = async (data) => {
  return await axios.post(API_URL, data);
};

// UPDATE Invoice Identification
export const updateInvoiceIdentification = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// DELETE Invoice Identification
export const deleteInvoiceIdentification = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
