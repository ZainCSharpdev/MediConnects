namespace PharmacyApi.DTO
{
    public class SearchMedicineResultDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public string pack_size_label { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string StockQuantity { get; set; } = string.Empty;

    }
}
