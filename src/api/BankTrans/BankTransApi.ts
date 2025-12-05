// src/api/BankTransApi.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/bank-trans';

export const getBankTrans = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching bank transactions:', error);
    throw error;
  }
};

export const getBankTransById = async (id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching bank transaction ${id}:`, error);
    throw error;
  }
};

export const createBankTrans = async (data: any) => {
  try {
    const response = await axios.post(BASE_URL, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating bank transaction:', error);
    throw error;
  }
};

export const updateBankTrans = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating bank transaction ${id}:`, error);
    throw error;
  }
};

export const deleteBankTrans = async (id: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting bank transaction ${id}:`, error);
    throw error;
  }
};
