using PharmacyApi.DTO;

namespace PharmacyApi.Repository.Dapper.Interface
{
    public interface ISupplierReadRepo
    {
        Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync();
    }
}
