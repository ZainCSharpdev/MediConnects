namespace PharmacyApi.DTO
{
    public class MedicineDto
    {
        public int MedicineId { get; set; }

        public string Name { get; set; } = null!;

        public string Category { get; set; } = null!;

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public DateTime ExpiryDate { get; set; }

        public decimal? CostPrice { get; set; }

        public int? ReorderLevel { get; set; }

        public int? SupplierId { get; set; }

        public int pack_size_label { get; set; }
    }
}
