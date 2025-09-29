import axios from "axios";

const SALES_TYPE_API = "http://localhost:8000/api/sales-types";
const SALES_GROUP_API = "http://localhost:8000/api/sales-groups";
const SALES_AREA_API = "http://localhost:8000/api/sales-areas";

/** ----- SalesType ----- */
export interface SalesType {
  id?: number;
  typeName: string;
  factor: number;
  taxIncl: boolean;
  status?: string;
}

export const getSalesTypes = async (): Promise<SalesType[]> => {
  const res = await axios.get(SALES_TYPE_API);
  return res.data;
};

export const getSalesType = async (id: number): Promise<SalesType> => {
  const res = await axios.get(`${SALES_TYPE_API}/${id}`);
  return res.data;
};

export const createSalesType = async (salesType: SalesType): Promise<SalesType> => {
  const res = await axios.post(SALES_TYPE_API, salesType);
  return res.data;
};

export const updateSalesType = async (id: number, salesType: SalesType): Promise<SalesType> => {
  const res = await axios.put(`${SALES_TYPE_API}/${id}`, salesType);
  return res.data;
};

export const deleteSalesType = async (id: number): Promise<void> => {
  await axios.delete(`${SALES_TYPE_API}/${id}`);
};

/** ----- SalesGroup ----- */
export interface SalesGroup {
  id?: number;
  name: string;
}

export const getSalesGroups = async (): Promise<SalesGroup[]> => {
  const res = await axios.get(SALES_GROUP_API);
  return res.data;
};

export const getSalesGroup = async (id: number): Promise<SalesGroup> => {
  const res = await axios.get(`${SALES_GROUP_API}/${id}`);
  return res.data;
};

export const createSalesGroup = async (salesGroup: SalesGroup): Promise<SalesGroup> => {
  const res = await axios.post(SALES_GROUP_API, salesGroup);
  return res.data;
};

export const updateSalesGroup = async (id: number, salesGroup: SalesGroup): Promise<SalesGroup> => {
  const res = await axios.put(`${SALES_GROUP_API}/${id}`, salesGroup);
  return res.data;
};

export const deleteSalesGroup = async (id: number): Promise<void> => {
  await axios.delete(`${SALES_GROUP_API}/${id}`);
};

/** ----- SalesArea ----- */
export interface SalesArea {
  id?: number;
  name: string;
}

export const getSalesAreas = async (): Promise<SalesArea[]> => {
  const res = await axios.get(SALES_AREA_API);
  return res.data;
};

export const getSalesArea = async (id: number): Promise<SalesArea> => {
  const res = await axios.get(`${SALES_AREA_API}/${id}`);
  return res.data;
};

export const createSalesArea = async (salesArea: SalesArea): Promise<SalesArea> => {
  const res = await axios.post(SALES_AREA_API, salesArea);
  return res.data;
};

export const updateSalesArea = async (id: number, salesArea: SalesArea): Promise<SalesArea> => {
  const res = await axios.put(`${SALES_AREA_API}/${id}`, salesArea);
  return res.data;
};

export const deleteSalesArea = async (id: number): Promise<void> => {
  await axios.delete(`${SALES_AREA_API}/${id}`);
};
