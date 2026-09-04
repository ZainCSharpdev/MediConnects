namespace PharmacyApi.DTO.Python
{
    public class SupplierLeadTimeDto
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public int OrdersAnalyzed { get; set; }
        public double? AvgLeadTimeDays { get; set; }
        public int? MinLeadTimeDays { get; set; }
        public int? MaxLeadTimeDays { get; set; }
        public int LateOrPendingOrders { get; set; }
    }
}
