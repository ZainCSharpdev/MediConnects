using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Dapper.Interface
{
    public interface ISaleReadRepo
    {
        Task<IEnumerable<SaleDto>> GetAllSalesAsync();
        Task<SaleDto?> GetSaleByIdAsync(int saleId);
    }
}
