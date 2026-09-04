using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Dapper.Interface
{
    public interface ISaleDetailReadRepo
    {
        Task<SaleDetailDto?> GetSaleDetailByIdAsync(int Id);
        Task<IEnumerable<SaleDetailDto>> GetSaleDetailsBySaleIdAsync(int saleId);
    }
}
