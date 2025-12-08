import axios from "axios";

const API_URL = "http://localhost:8000/api/depreciation-periods";

// GET all Depreciation Periods
export const getDepreciationPeriods = async () => {
  return await axios.get(API_URL);
};

// GET single Depreciation Period by ID
export const getDepreciationPeriod = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// CREATE new Depreciation Period
export const createDepreciationPeriod = async (data) => {
  return await axios.post(API_URL, data);
};

// UPDATE Depreciation Period
export const updateDepreciationPeriod = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// DELETE Depreciation Period
export const deleteDepreciationPeriod = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
