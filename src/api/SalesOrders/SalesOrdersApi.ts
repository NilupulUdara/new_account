import axios from "axios";

const SALES_ORDERS_URL = "http://localhost:8000/api/sales-orders"; // Adjust if backend base differs

// Backend validation lists order_no as required|integer. Until backend changes, send a provisional value.
export interface SalesOrderPayload {
  order_no: number;            // provisional; backend may override
  trans_type: number;          // 30 for quotation
  version: number;             // 0
  type: number;                // 0
  debtor_no: number;           // customer id
  branch_code: number;         // branch code/id
  reference: string;           // reference code 001/{fiscalYear}
  ord_date: string;            // quotation date YYYY-MM-DD
  order_type: number;          // price list id
  ship_via: number;
  customer_ref: string | null;            // integer id (fallback 0 if unknown)
  delivery_address: string | null; // customer address
  contact_phone: string | null;    // customer phone
  contact_email: string | null;    // customer email
  deliver_to: string | null;       // customer name
  freight_cost: number;        // 0
  from_stk_loc: string;        // deliver from loc_code
  delivery_date: string | null;    // chosen date
  payment_terms: number | null;    // nullable
  total: number;               // 0 (not calculated yet)
  prep_amount: number;         // 0
  alloc: number;               // 0
}

export const createSalesOrder = async (payload: SalesOrderPayload) => {
  const response = await axios.post(SALES_ORDERS_URL, payload);
  return response.data; // Expect response to include generated/accepted order_no
};

export const updateSalesOrder = async (orderNo: number, payload: SalesOrderPayload) => {
  const response = await axios.put(`${SALES_ORDERS_URL}/${orderNo}`, payload);
  return response.data;
};

export const generateProvisionalOrderNo = (): number => {
  // Simple timestamp-based fallback; replace with backend sequence endpoint if available.
  return Date.now();
};

export const getSalesOrders = async () => {
  const response = await axios.get(SALES_ORDERS_URL);
  return response.data;
};

export const getSalesOrderByOrderNo = async (orderNo: string | number) => {
  try {
    const response = await axios.get(`${SALES_ORDERS_URL}/${orderNo}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sales order ${orderNo}:`, error);
    return null;
  }
};
