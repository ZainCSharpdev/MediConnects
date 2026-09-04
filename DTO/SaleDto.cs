namespace PharmacyApi.DTO
{
    public class SaleDto
    {
        public int SaleId { get; set; }
        public DateTime SaleDate { get; set; }

        public string Invoice { get; set; } = null!;

        public string CustomerName { get; set; } = null!;

        public decimal TotalAmount { get; set; }

        public decimal Discount { get; set; }

        public decimal NetAmount { get; set; }

        public string Method { get; set; } = null!;
    }
}
