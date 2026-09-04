namespace PharmacyApi.DTO.Python
{
    public class LowStockMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public int StockQuantity { get; set; }
        public int ReorderLevel { get; set; }
        public int Shortfall { get; set; }
        public int? SupplierId { get; set; }
        public string SupplierName { get; set; }
    }
}
