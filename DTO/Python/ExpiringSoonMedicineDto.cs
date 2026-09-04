using System.Text.Json.Serialization;

namespace PharmacyApi.DTO.Python
{
    public class ExpiringSoonMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public string Category { get; set; }
        public int StockQuantity { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public int DaysUntilExpiry { get; set; }
    }
}
