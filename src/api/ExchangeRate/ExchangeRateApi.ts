// src/api/ExchangeRate/exchangeRateApi.ts
import axios from "axios";

export interface ExchangeRate {
  id: number;
  date_to_use: string;
  exchange_rate: number;
  currency: string; 
}

const API_URL = "http://localhost:8000/api/exchange-rates";

export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createExchangeRate = async (
  data: Partial<ExchangeRate>
): Promise<ExchangeRate> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateExchangeRate = async (
  id: number | string,
  data: Partial<ExchangeRate>
): Promise<ExchangeRate> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteExchangeRate = async (id: number | string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
