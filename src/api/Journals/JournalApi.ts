import axios from "axios";

const API_URL = "http://localhost:8000/api/journals";

export interface JournalPayload {
  type: number;          // reflines.trans_type
  trans_no: number;
  tran_date?: string;
  reference?: string;
  source_ref?: string;
  event_date?: string;
  doc_date?: string;
  currency?: string;
  amount: number;
  rate?: number;
}

export const getJournals = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching journals:", error);
    return [];
  }
};

export const getJournalById = async (id: number | string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journal ${id}:`, error);
    return null;
  }
};

export const getJournalsByTransNo = async (transNo: number) => {
  try {
    const response = await axios.get(API_URL);
    return response.data.filter(
      (row: any) => Number(row.trans_no) === Number(transNo)
    );
  } catch (error) {
    console.error("Error filtering journals:", error);
    return [];
  }
};

export const createJournal = async (payload: JournalPayload) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating journal:",
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const updateJournal = async (
  id: number | string,
  payload: JournalPayload
) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating journal ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};

export const deleteJournal = async (id: number | string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error deleting journal ${id}:`,
      error.response?.data || error
    );
    throw error.response?.data || error;
  }
};
