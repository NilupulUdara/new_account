import axios from "axios";

const API_URL = "http://localhost:8000/api/depreciation-methods";

// GET all Depreciation Methods
export const getDepreciationMethods = async () => {
  return await axios.get(API_URL);
};

// GET single Depreciation Method by ID
export const getDepreciationMethod = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// CREATE new Depreciation Method
export const createDepreciationMethod = async (data) => {
  return await axios.post(API_URL, data);
};

// UPDATE Depreciation Method
export const updateDepreciationMethod = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// DELETE Depreciation Method
export const deleteDepreciationMethod = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
