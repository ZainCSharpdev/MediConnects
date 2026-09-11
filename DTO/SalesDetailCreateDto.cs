namespace PharmacyApi.DTO
{
    public class SalesDetailCreateDto
    {
        public int MedicineId { get; set; }
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
