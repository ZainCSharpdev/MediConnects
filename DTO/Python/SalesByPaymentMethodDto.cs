namespace PharmacyApi.DTO.Python
{
    public class SalesByPaymentMethodDto
    {
        public string Method { get; set; }
        public int TransactionCount { get; set; }
        public decimal TotalNetAmount { get; set; }
    }
}
