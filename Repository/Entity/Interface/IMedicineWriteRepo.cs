using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Entity.Interface
{
    public interface IMedicineWriteRepo
    {
        Task AddMedicineAsync(MedicineDto dto);
        Task UpdateMedicineAsync(MedicineDto dto, int MedicineId);
        Task DeleteMedicineAsync(int MedicineId);
    }
}
