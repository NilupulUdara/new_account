import axios from "axios";

const API_BASE = "http://localhost:8000/api/supp-invoice-items";

export const getSuppInvoiceItems = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const getSuppInvoiceItemById = async (id: string | number) => {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
};

export const createSuppInvoiceItem = async (data: any) => {
  const res = await axios.post(API_BASE, data);
  return res.data;
};

export const updateSuppInvoiceItem = async (id: string | number, data: any) => {
  const res = await axios.put(`${API_BASE}/${id}`, data);
  return res.data;
};

export const deleteSuppInvoiceItem = async (id: string | number) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};
