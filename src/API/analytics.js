import api from './Api';

export const getProfitLoss = async () => {
  const res = await api.get('/analytics/profit-loss');
  return res.data;
};

export const getProfitLossByMedicine = async () => {
  const res = await api.get('/analytics/profit-loss/by-medicine');
  return res.data;
};

export const getLossMakingMedicines = async () => {
  const res = await api.get('/analytics/loss-making-medicines');
  return res.data;
};

export const getLowStockAnalytics = async () => {
  const res = await api.get('/analytics/low-stock');
  return res.data;
};

export const getSupplierLeadTime = async () => {
  const res = await api.get('/analytics/supplier-lead-time');
  return res.data;
};

export const getSupplierMedicineCosts = async (supplierId) => {
  const res = await api.get(`/analytics/suppliers/${supplierId}/medicine-costs`);
  return res.data;
};

export const getTopMedicines = async () => {
  const res = await api.get('/analytics/top-medicines');
  return res.data;
};

export const getExpiringSoonAnalytics = async () => {
  const res = await api.get('/analytics/expiring-soon');
  return res.data;
};

export const getSalesByPaymentMethod = async () => {
  const res = await api.get('/analytics/sales-by-payment-method');
  return res.data;
};