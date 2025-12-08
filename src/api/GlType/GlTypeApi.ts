import axios from "axios";

const API_URL = "http://localhost:8000/api/gl-types";

// GET all GL Types
export const getGlTypes = async () => {
  return await axios.get(API_URL);
};

// GET single GL Type by ID
export const getGlType = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// CREATE new GL Type
export const createGlType = async (data) => {
  return await axios.post(API_URL, data);
};

// UPDATE GL Type
export const updateGlType = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// DELETE GL Type
export const deleteGlType = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
