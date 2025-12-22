import axios from "axios";

const WORK_ORDERS_URL = "http://localhost:8000/api/work-orders";

export interface WorkOrderPayload {
  wo_ref: string;
  loc_code: string;
  units_reqd: number;
  stock_id: string;
  date: string;
  type: number;
  required_by: string;
  released_date: string;
  units_issued: number;
  closed: boolean;
  released: boolean;
  additional_costs: number;
}

export const getWorkOrders = async () => {
  try {
    const response = await axios.get(WORK_ORDERS_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return [];
  }
};

export const getWorkOrderById = async (id: number | string) => {
  try {
    const response = await axios.get(`${WORK_ORDERS_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching work order ${id}:`, error);
    return null;
  }
};

export const createWorkOrder = async (payload: WorkOrderPayload) => {
  try {
    const response = await axios.post(WORK_ORDERS_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating work order:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateWorkOrder = async (
  id: number | string,
  payload: WorkOrderPayload
) => {
  try {
    const response = await axios.put(`${WORK_ORDERS_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating work order ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteWorkOrder = async (id: number | string) => {
  try {
    const response = await axios.delete(`${WORK_ORDERS_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting work order ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
