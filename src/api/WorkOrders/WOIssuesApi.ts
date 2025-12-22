import axios from "axios";

const API_URL = "http://localhost:8000/api/wo-issues";

export interface WoIssuePayload {
  issue_no: number;
  workorder_id: number;
  reference?: string | null;
  issue_date?: string | null; // YYYY-MM-DD
  loc_code?: string | null;
  work_centre?: number | null;
}

export const getWoIssues = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching WO issues:", error);
    return [];
  }
};

export const getWoIssueById = async (issueNo: number | string) => {
  try {
    const response = await axios.get(`${API_URL}/${issueNo}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching WO issue ${issueNo}:`, error);
    return null;
  }
};

export const getWoIssuesByWorkOrder = async (workorderId: number) => {
  try {
    const response = await axios.get(API_URL);
    return response.data.filter(
      (row: any) => Number(row.workorder_id) === Number(workorderId)
    );
  } catch (error) {
    console.error("Error filtering WO issues:", error);
    return [];
  }
};

export const createWoIssue = async (payload: WoIssuePayload) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating WO issue:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateWoIssue = async (
  issueNo: number | string,
  payload: WoIssuePayload
) => {
  try {
    const response = await axios.put(`${API_URL}/${issueNo}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating WO issue ${issueNo}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteWoIssue = async (issueNo: number | string) => {
  try {
    const response = await axios.delete(`${API_URL}/${issueNo}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting WO issue ${issueNo}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
