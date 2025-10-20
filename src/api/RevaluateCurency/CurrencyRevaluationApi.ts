// src/api/CurrencyRevaluationApi.ts
import axios from "axios";

export interface RevaluateCurrenciesPayload {
  date: Date; // "YYYY-MM-DD"
  memo: string;
}

const API_URL = "http://localhost:8000/api/revaluate-currencies";

export const revaluateCurrencies = async (data: RevaluateCurrenciesPayload) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};
