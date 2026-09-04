import api from './Api'

export const loginUser = async (credentials) => {
  const res = await api.post('/Auth/login', credentials);
  if (res.data) {
    localStorage.setItem('user', JSON.stringify(res.data));
  }
  return res.data;
};

export const signinUser = async (userData) => {
  const res = await api.post('/Auth/signin', userData);
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await api.post('/Auth/change-password', passwordData);
  return res.data;
};