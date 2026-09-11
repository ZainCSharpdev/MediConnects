namespace PharmacyApi.DTO
{
    public class CreateSaleRequest
    {
        public SaleCreateDto Sale { get; set; } = new SaleCreateDto();
        public List<SalesDetailCreateDto> SaleDetails { get; set; } = new List<SalesDetailCreateDto>();
    }
}
