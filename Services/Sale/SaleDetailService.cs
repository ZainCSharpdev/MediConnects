using PharmacyApi.DTO;
using PharmacyApi.Repository.Dapper.Interface;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Services.Sale
{
    public class SaleDetailService(ISaleDetailReadRepo _readRepo,ISaleDetailsWriteRepo _writeRepo, ISaleWriteRepo _saleWriteRepo)
    {
       public async Task<SaleDetailDto?> GetSaleDetailByIdAsync(int id) =>
            await _readRepo.GetSaleDetailByIdAsync(id);

        public async Task<IEnumerable<SaleDetailDto>> GetSaleDetailsBySaleIdAsync(int saleId) =>
            await _readRepo.GetSaleDetailsBySaleIdAsync(saleId);

        public async Task CreateSaleDetailAsync(SaleDetailDto dto)
        {
            await _writeRepo.AddSaleDetailAsync(dto);
            await _saleWriteRepo.UpdateSaleAsync(new SaleDto { SaleId = dto.SaleId });
        }

        public async Task UpdateSaleDetailAsync(SaleDetailDto dto)
        {
            await _writeRepo.UpdateSaleDetailAsync(dto);
            await _saleWriteRepo.UpdateSaleAsync(new SaleDto { SaleId = dto.SaleId });
        }
        
        public async Task DeleteSaleDetailsAsync(int id)
        {
            var detail = await _readRepo.GetSaleDetailByIdAsync(id);
            if(detail != null)
            {
                await _writeRepo.DeleteSaleDetailAsync(id);
                await _saleWriteRepo.UpdateSaleAsync(new SaleDto { SaleId= detail.SaleId });
            }
        }
    }
}
