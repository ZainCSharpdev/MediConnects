using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Dapper.Interface
{
    public interface IMedicineReadRepo
    {
        Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync();
        Task<MedicineDto> GetMedicineByIdAsync(int medicineId);
        Task<int> GetMedicineCount();
    }
}
