import api from './Api';

export const getSaleDetailById = async (id) => {
  const res = await api.get(`/SaleDetail/${id}`);
  return res.data;
};

export const updateSaleDetail = async (id, detailData) => {
  const res = await api.put(`/SaleDetail/${id}`, detailData);
  return res.data;
};

export const deleteSaleDetail = async (id) => {
  const res = await api.delete(`/SaleDetail/${id}`);
  return res.data;
};

export const getSaleDetailsBySaleId = async (saleId) => {
  const res = await api.get(`/SaleDetail/bySale/${saleId}`);
  return res.data;
};
export const createSale = async (saleData) => {
  const res = await api.post('/Sale', saleData);
  return res.data;
};