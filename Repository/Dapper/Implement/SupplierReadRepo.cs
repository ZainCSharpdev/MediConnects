using Dapper;
using PharmacyApi.DTO;
using PharmacyApi.Repository.Dapper.Interface;
using System.Data;

namespace PharmacyApi.Repository.Dapper.Implement
{
    public class SupplierReadRepo : ISupplierReadRepo
    {
        private readonly IDbConnection _db;
        public SupplierReadRepo(IDbConnection db)
        {
            _db = db;
        }
        public async Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync() =>
            await _db.QueryAsync<SupplierDto>("SELECT * FROM Suppliers");
    }
}
