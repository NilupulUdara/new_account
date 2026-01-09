import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/refs";

export interface Ref {
  id?: number | null;
  type: number;
  reference: string;
}

export const getRefs = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const getRefById = async (id: number | string) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const createRef = async (data: Ref) => {
  const response = await axios.post(API_BASE_URL, data);
  return response.data;
};

export const updateRef = async (id: number | string, data: Ref) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteRef = async (id: number | string) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
