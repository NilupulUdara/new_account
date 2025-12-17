import axios from "axios";

const API_URL = "http://localhost:8000/api/cust-allocations";

// GET all Depreciation Methods
export const getCustAllocations = async () => {
  return await axios.get(API_URL);
};

// GET single Depreciation Method by ID
export const getCustAllocation = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// CREATE new Depreciation Method
export const createCustAllocation = async (data) => {
  return await axios.post(API_URL, data);
};

// UPDATE Depreciation Method
export const updateCustAllocation = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// DELETE Depreciation Method
export const deleteCustAllocation = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
