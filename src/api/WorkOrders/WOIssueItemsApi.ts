import axios from "axios";

const API_URL = "http://localhost:8000/api/wo-issue-items";

export interface WoIssueItemPayload {
  stock_id: string;
  issue_id: number;
  qty_issued: number;
  unit_cost: number;
}

export const getWoIssueItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching WO issue items:", error);
    return [];
  }
};

export const getWoIssueItemById = async (id: number | string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WO issue item ${id}:`, error);
    return null;
  }
};

export const getWoIssueItemsByIssueNo = async (issueNo: number) => {
  try {
    const response = await axios.get(API_URL);
    return response.data.filter(
      (row: any) => Number(row.issue_id) === Number(issueNo)
    );
  } catch (error) {
    console.error("Error filtering WO issue items:", error);
    return [];
  }
};

export const createWoIssueItem = async (
  payload: WoIssueItemPayload
) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating WO issue item:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateWoIssueItem = async (
  id: number | string,
  payload: WoIssueItemPayload
) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating WO issue item ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteWoIssueItem = async (id: number | string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting WO issue item ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
