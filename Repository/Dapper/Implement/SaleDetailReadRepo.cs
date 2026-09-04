using Dapper;
using PharmacyApi.DTO;
using PharmacyApi.Repository.Dapper.Interface;
using System.Data;

namespace PharmacyApi.Repository.Dapper.Implement
{
    public class SaleDetailReadRepo : ISaleDetailReadRepo
    {
        private readonly IDbConnection _db;
        public SaleDetailReadRepo(IDbConnection db)
        {
            _db = db;
        }
        public async Task<SaleDetailDto?> GetSaleDetailByIdAsync(int Id) =>
            await _db.QueryFirstOrDefaultAsync<SaleDetailDto>("SELECT * FROM SaleDetails WHERE Id = @Id", new { Id = Id });

        public async Task<IEnumerable<SaleDetailDto>> GetSaleDetailsBySaleIdAsync(int saleId) =>
            await _db.QueryAsync<SaleDetailDto>("SELECT * FROM SaleDetails WHERE SaleId = @SaleId", new { SaleId = saleId });
    }
}
