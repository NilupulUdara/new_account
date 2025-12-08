import axios from "axios";

const API_URL = "http://localhost:8000/api/tax-algorithms";

// GET all Tax Algorithms
export const getTaxAlgorithms = async () => {
  return await axios.get(API_URL);
};

// GET single Tax Algorithm by ID
export const getTaxAlgorithm = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// CREATE new Tax Algorithm
export const createTaxAlgorithm = async (data) => {
  return await axios.post(API_URL, data);
};

// UPDATE Tax Algorithm
export const updateTaxAlgorithm = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// DELETE Tax Algorithm
export const deleteTaxAlgorithm = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
