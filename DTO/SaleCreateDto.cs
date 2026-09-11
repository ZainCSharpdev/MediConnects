namespace PharmacyApi.DTO
{
    public class SaleCreateDto
    {
        public string CustomerName { get; set; } = null!;
        public decimal Discount { get; set; }
        public string Method { get; set; } = null!;
    }
}
