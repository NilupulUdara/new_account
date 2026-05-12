// PaymentTypeApi.ts
import axios from "axios";

export const getPaymentTypes = async () => {
  const response = await axios.get("http://127.0.0.1:8000/api/payment-types");
  return response.data; // adjust depending on your API response format
};

