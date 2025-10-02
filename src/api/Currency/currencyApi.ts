import axios from "axios";

export interface Currency {
  id: number;
  currency_abbreviation: string;
  currency_symbol: string;
  currency_name: string;
  hundredths_name: string;
  country: string;
  auto_exchange_rate_update: boolean;
}


const API_URL = "http://localhost:8000/api/currencies"; 

export const createCurrency = async (currencyData: Partial<Currency>): Promise<Currency> => {
  const response = await axios.post(API_URL, currencyData);
  return response.data;
};

export const getCurrencies = async (): Promise<Currency[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getCurrency = async (id: string | number): Promise<Currency> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateCurrency = async (id: string | number, currencyData: Partial<Currency>): Promise<Currency> => {
  const response = await axios.put(`${API_URL}/${id}`, currencyData);
  return response.data;
};

export const deleteCurrency = async (id: string | number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};