import api from './Api'

export const getSales = async () => {
  const res = await api.get('/Sale');
  return res.data;
};

export const createSale = async (saleData) => {
  const res = await api.post('/Sale', saleData);
  return res.data;
};

export const getSaleById = async (id) => {
  const res = await api.get(`/Sale/${id}`);
  return res.data;
};

export const updateSale = async (id, saleData) => {
  const res = await api.put(`/Sale/${id}`, saleData);
  return res.data;
};

export const deleteSale = async (id) => {
  const res = await api.delete(`/Sale/${id}`);
  return res.data;
};