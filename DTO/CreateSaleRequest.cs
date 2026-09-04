namespace PharmacyApi.DTO
{
    public class CreateSaleRequest
    {
        public SaleDto Sale { get; set; } = new SaleDto();
        public List<SaleDetailDto> SaleDetails { get; set; } = new List<SaleDetailDto>();
    }
}
