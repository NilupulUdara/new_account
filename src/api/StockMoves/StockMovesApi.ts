import axios from "axios";

const API_URL = "http://localhost:8000/api/stock-moves";

//  Get all
export const getStockMoves = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

//  Get by ID
export const getStockMoveById = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

//  Create new
export const createStockMove = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

//  Update
export const updateStockMove = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

//  Delete
export const deleteStockMove = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
