using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Entity.Interface
{
    public interface ISaleWriteRepo
    {
        Task<int> AddSaleAsync(SaleDto dto,List<SaleDetailDto> details);
        Task<int> UpdateSaleAsync(SaleDto dto);
        Task<int> DeleteSaleAsync(int id);
    }
}
