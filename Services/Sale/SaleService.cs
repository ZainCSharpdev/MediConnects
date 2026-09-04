using PharmacyApi.DTO;
using PharmacyApi.Repository.Dapper.Interface;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Services.Sale
{
    public class SaleService(ISaleReadRepo _saleRead, ISaleWriteRepo _saleWrite)
    {
        //Read Rows
        public async Task<IEnumerable<SaleDto>> GetAllSalesAsync() =>
            await _saleRead.GetAllSalesAsync();

        //Get by ID
        public async Task<SaleDto?> GetSaleByIdAsync(int id) =>
            await _saleRead.GetSaleByIdAsync(id);

        //Creating sale (Add)
        public async Task<int> CreateSaleAsync(SaleDto dto, List<SaleDetailDto> details)
        {
            dto.SaleDate = DateTime.Now;
            return await _saleWrite.AddSaleAsync(dto, details);
        }

        //Editing Sale(Update)
        public async Task UpdateSaleAsync(SaleDto dto) =>
            await _saleWrite.UpdateSaleAsync(dto);

        //Delete sale(Remove)
        public async Task DeleteSaleAsync(int id) =>
            await _saleWrite.DeleteSaleAsync(id);


    }
}
