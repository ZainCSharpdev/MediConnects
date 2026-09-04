namespace PharmacyApi.DTO.Python
{
    public class SupplierMedicineCostDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public decimal AvgUnitCost { get; set; }
        public decimal MinUnitCost { get; set; }
        public decimal MaxUnitCost { get; set; }
        public int TotalQuantityOrdered { get; set; }
    }
}
