using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyApi.DTO;
using PharmacyApi.Services.Sale;

namespace PharmacyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaleController(SaleService _serve) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllSale()
        {
            var sale = await _serve.GetAllSalesAsync();
            return Ok(sale);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSaleById(int id)
        {
            var sale = await _serve.GetSaleByIdAsync(id);
            if (sale == null) return NotFound();
            return Ok(sale);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleRequest request)
        {
            var saleId = await _serve.CreateSaleAsync(request.Sale, request.SaleDetails);
            return CreatedAtAction(nameof(GetSaleById), new { id = saleId }, request.Sale);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSale(int id, [FromBody] SaleDto dto)
        {
            if (id != dto.SaleId) return BadRequest("ID mismatch");
            await _serve.UpdateSaleAsync(dto);
            return Ok(dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            await _serve.DeleteSaleAsync(id);
            return NoContent();
        }
    }
}
