namespace PharmacyApi.DTO.Python
{
    public class ProfitLossByMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public decimal Revenue { get; set; }
        public decimal Cost { get; set; }
        public decimal Profit { get; set; }
        public decimal MarginPct { get; set; }
        public string status { get; set; }
    }
}
