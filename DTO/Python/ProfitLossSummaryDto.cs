namespace PharmacyApi.DTO.Python
{
    public class ProfitLossSummaryDto
    {
        public DateOnly PeriodStart { get; set; }
        public DateOnly PeriodEnd { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalCost { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal GrossMarginPct { get; set; }
    }
}
