namespace PharmacyApi.DTO
{
    public class SaleDetailDto
    {
        public int SaleDetailId { get; set; }
        public int SaleId { get; set; }
        public int MedicineId { get; set; }
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
