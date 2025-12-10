import axios from "axios";

const PURCH_ORDERS_URL = "http://localhost:8000/api/purch-orders"; 
// Adjust if backend base differs

// Backend validation requires order_no as primary integer
export interface PurchOrderPayload {
  order_no: number;             // Primary key
  supplier_id: number;         // FK from suppliers
  comments: string | null;
  ord_date: string;            // YYYY-MM-DD
  reference: string;           // Reference code
  requisition_no: string | null;
  into_stock_location: string; // loc_code
  delivery_address: string;
  total: number;
  prep_amount: number;
  alloc: number;
  tax_included: boolean;
}

/**
 * CREATE Purchase Order
 */
export const createPurchOrder = async (payload: PurchOrderPayload) => {
  const response = await axios.post(PURCH_ORDERS_URL, payload);
  return response.data;
};

/**
 * UPDATE Purchase Order
 */
export const updatePurchOrder = async (
  orderNo: number,
  payload: PurchOrderPayload
) => {
  const response = await axios.put(`${PURCH_ORDERS_URL}/${orderNo}`, payload);
  return response.data;
};

/**
 * GET All Purchase Orders
 */
export const getPurchOrders = async () => {
  const response = await axios.get(PURCH_ORDERS_URL);
  return response.data;
};

/**
 * GET Single Purchase Order by Order No
 */
export const getPurchOrderByOrderNo = async (orderNo: string | number) => {
  try {
    const response = await axios.get(`${PURCH_ORDERS_URL}/${orderNo}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase order ${orderNo}:`, error);
    return null;
  }
};

/**
 * DELETE Purchase Order
 */
export const deletePurchOrder = async (orderNo: number) => {
  const response = await axios.delete(`${PURCH_ORDERS_URL}/${orderNo}`);
  return response.data;
};

/**
 * Generate Provisional Order No (Frontend fallback)
 */
export const generateProvisionalPurchOrderNo = (): number => {
  // Replace with backend sequence when available
  return Date.now();
};
