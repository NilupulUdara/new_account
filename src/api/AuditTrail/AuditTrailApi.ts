// src/api/AuditTrail/auditTrailApi.ts
import axios from "axios";

const BASE_URL = "http://localhost:8000/api/audit-trails";

const auditTrailApi = {

  getAll: async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axios.post(BASE_URL, data);
    return response.data;
  },

  update: async (id: number | string, data: any) => {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

};

export default auditTrailApi;
