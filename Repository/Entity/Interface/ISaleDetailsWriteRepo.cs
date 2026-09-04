using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Entity.Interface
{
    public interface ISaleDetailsWriteRepo
    {
        Task AddSaleDetailAsync(SaleDetailDto dto);
        Task UpdateSaleDetailAsync(SaleDetailDto dto);
        Task DeleteSaleDetailAsync(int id);
    }
}
