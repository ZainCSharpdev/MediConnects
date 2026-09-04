using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyApi.Services.PythonAnalysis;

namespace PharmacyApi.Controllers
{
    [Route("api/analytics")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsService _analyticsService;

        public AnalyticsController(AnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }
        [HttpGet("profit-loss")]
        public async Task<IActionResult> GetProfitLoss([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate)
        {
            var result = await _analyticsService.GetProfitLossSummaryAsync(startDate, endDate);
            return Ok(result);
        }

        [HttpGet("profit-loss/by-medicine")]
        public async Task<IActionResult> GetProfitLossByMedicine([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate, [FromQuery] int limit = 50)
        {
            var result = await _analyticsService.GetProfitLossByMedicineAsync(startDate, endDate, limit);
            return Ok(result);
        }

        [HttpGet("loss-making-medicines")]
        public async Task<IActionResult> GetLossMakingMedicines([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate, [FromQuery] int limit = 50)
        {
            var result = await _analyticsService.GetLossMakingMedicinesAsync(startDate, endDate, limit);
            return Ok(result);
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock([FromQuery] int? threshold)
        {
            var result = await _analyticsService.GetStockAlertsAsync(threshold);
            return Ok(result);
        }

        [HttpGet("supplier-lead-time")]
        public async Task<IActionResult> GetSupplierLeadTime([FromQuery] int monthsBack = 12)
        {
            var result = await _analyticsService.GetSupplierLeadTimesAsync(monthsBack);
            return Ok(result);
        }

        [HttpGet("suppliers/{supplierId}/medicine-costs")]
        public async Task<IActionResult> GetSupplierMedicineCosts(int supplierId)
        {
            var result = await _analyticsService.GetSupplierMedicineCostsAsync(supplierId);
            return Ok(result);
        }

        [HttpGet("top-medicines")]
        public async Task<IActionResult> GetTopSellingMedicines([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate, [FromQuery] int limit = 10)
        {
            var result = await _analyticsService.GetTopSellingMedicinesAsync(startDate, endDate, limit);
            return Ok(result);
        }

        [HttpGet("expiring-soon")]
        public async Task<IActionResult> GetExpiringSoon([FromQuery] int daysAhead = 90)
        {
            var result = await _analyticsService.GetExpiringSoonMedicinesAsync(daysAhead);
            return Ok(result);
        }

        [HttpGet("sales-by-payment-method")]
        public async Task<IActionResult> GetSalesByPaymentMethod([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate)
        {
            var result = await _analyticsService.GetSalesByPaymentMethodAsync(startDate, endDate);
            return Ok(result);
        }
    }
}
