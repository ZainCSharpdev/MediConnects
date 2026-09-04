using Dapper;
using PharmacyApi.DTO;
using PharmacyApi.Repository.Dapper.Interface;
using System.Data;

namespace PharmacyApi.Repository.Dapper.Implement
{
    public class SaleReadRepo : ISaleReadRepo
    {
        private readonly IDbConnection _db;
        public SaleReadRepo(IDbConnection db)
        {
            _db = db;
        }

        public async Task<IEnumerable<SaleDto>> GetAllSalesAsync() =>
            await _db.QueryAsync<SaleDto>("SELECT * FROM Sales");

        public async Task<SaleDto?> GetSaleByIdAsync(int saleId) =>
            await _db.QueryFirstOrDefaultAsync<SaleDto>("SELECT * FROM Sales WHERE SaleId = @Id", new { Id = saleId });
    }
}
