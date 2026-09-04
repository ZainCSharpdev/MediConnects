import api from "./Api";

export const getMedicines = async () => {
  const res = await api.get("/Medicine");
  return res.data;
};

export const getMedicineById = async (id) => {
  const res = await api.get(`/Medicine/${id}`);
  return res.data;
};

export const getMedicineCount = async () =>{
    const res = await api.get(`/Medicine/count`);
    return res.data;
}

export const getSupplier = async () =>{
  const res = await api.get(`/Medicine/Suppliers`);
  return res.data;
}

export const searchMedicines = async (name) => {
  const res = await api.get(`/Medicine/search?name=${name}`);
  return res.data;
};

export const createMedicine = async (medicineData) => {
  const res = await api.post("/Medicine", medicineData);
  return res.data;
};

export const updateMedicine = async (id, medicineData) => {
  const res = await api.put(`/Medicine/${id}`, medicineData);
  return res.data;
};

export const deleteMedicine = async (id) => {
  const res = await api.delete(`/Medicine/${id}`);
  return res.data;
};