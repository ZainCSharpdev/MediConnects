namespace PharmacyApi.DTO
{
    public class SupplierDto
    {
        public int SupplierId { get; set; }

        public string SupplierName { get; set; } = null!;

        public string? ContactEmail { get; set; }

        public string? Phone { get; set; }
    }
}
