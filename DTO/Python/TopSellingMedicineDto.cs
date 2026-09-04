namespace PharmacyApi.DTO.Python
{
    public class TopSellingMedicineDto
    {
        public int Rank { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public decimal UnitsSold { get; set; }
        public decimal Revenue { get; set; }
    }
}
