using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyApi.DTO;
using PharmacyApi.Services.Sale;

namespace PharmacyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaleDetailController(SaleDetailService _serve) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSaleDetailById(int id)
        {
            var detail = await _serve.GetSaleDetailByIdAsync(id);
            if (detail == null) return NotFound();
            return Ok(detail);
        }

        [HttpGet("bySale/{saleId}")]
        public async Task<IActionResult> GetSaleDetailsBySaleId(int saleId)
        {
            var details = await _serve.GetSaleDetailsBySaleIdAsync(saleId);
            return Ok(details);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSaleDetail([FromBody] SaleDetailDto dto)
        {
            await _serve.CreateSaleDetailAsync(dto);
            return CreatedAtAction(nameof(GetSaleDetailById), new { id = dto.SaleDetailId }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSaleDetail(int id, [FromBody] SaleDetailDto dto)
        {
            if (id != dto.SaleDetailId) return BadRequest("ID mismatch");
            await _serve.UpdateSaleDetailAsync(dto);
            return Ok(dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSaleDetail(int id)
        {
            await _serve.DeleteSaleDetailsAsync(id);
            return NoContent();
        }
    }
}
