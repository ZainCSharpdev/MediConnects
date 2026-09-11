using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyApi.DTO;
using PharmacyApi.Services.Medicine;

namespace PharmacyApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicineController(MedicineService _service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllMedicines()
        {
            var medicines = await _service.GetAllMedicinesAsync();
            return Ok(medicines);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineById(int id)
        {
            var medicine = await _service.GetMedicineByIdAsync(id);
            if (medicine == null)
            {
                return NotFound();
            }
            return Ok(medicine);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetMedicineCount()
        {
            var count = await _service.GetMedicineCount();
            return Ok(new { Count = count });
        }
        [HttpGet("Suppliers")]
        public async Task<IActionResult> GetAllSuppliers()
        {
            var suppliers = await _service.GetAllSuppliersAsync();
            return Ok(suppliers);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMedicineByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Search term cannot be empty.");
            }

            var medicines = await _service.SearchMedicineByNameAsync(name);

            if (!medicines.Any())
            {
                return NotFound("No medicines found matching the search term.");
            }

            return Ok(medicines);
        }


        [HttpPost]
        public async Task<IActionResult> AddMedicine([FromBody] MedicineDto dto)
        {
            await _service.AddMedicineAsync(dto);
            return CreatedAtAction(nameof(GetMedicineById), new { id = dto.MedicineId }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicine(int id, [FromBody] MedicineDto dto)
        {
            dto.MedicineId = id;
            var updatedMedicine = await _service.UpdateMedicineAsync(dto, id);
            return Ok(updatedMedicine);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            await _service.DeleteMedicineAsync(id);
            return NoContent();
        }
    }
}
