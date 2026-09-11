using Microsoft.EntityFrameworkCore;
using PharmacyApi.DTO;
using PharmacyApi.Models;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Repository.Entity.Implement
{
    public class MedicineWriteRepo(PharmacyDbContext _context) : IMedicineWriteRepo
    {
        public async Task AddMedicineAsync(MedicineDto dto)
        {
            var product = new Medicine
            {
                Name = dto.Name,
                Category = dto.Category,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                ExpiryDate = dto.ExpiryDate,
                CostPrice = dto.CostPrice,
                ReorderLevel = dto.ReorderLevel,
                SupplierId = dto.SupplierId,
                pack_size_label = dto.pack_size_label
            };
            _context.Medicines.Add(product);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMedicineAsync(MedicineDto dto, int MedicineId)
        {
            var medicine = await _context.Medicines.FindAsync(MedicineId);
            if(medicine != null)
            {
                medicine.Name = dto.Name;
                medicine.Category = dto.Category;
                medicine.Price = dto.Price;
                medicine.StockQuantity = dto.StockQuantity;
                medicine.ExpiryDate = dto.ExpiryDate;
                medicine.CostPrice = dto.CostPrice;
                medicine.ReorderLevel = dto.ReorderLevel;
                medicine.SupplierId = dto.SupplierId;
                medicine.pack_size_label = dto.pack_size_label;
                await _context.SaveChangesAsync();
            }
            if(medicine == null)
            {
                throw new Exception($"Medicine with ID {dto.MedicineId} not found.");
            }
        }

        public async Task DeleteMedicineAsync(int MedicineId)
        {
            var medicine = await _context.Medicines.FindAsync(MedicineId);
            if (medicine != null)
            {
                _context.Medicines.Remove(medicine);
                await _context.SaveChangesAsync();
            }
            if (medicine == null)
            {
                throw new Exception($"Medicine with ID {MedicineId} not found.");
            }
        }
    }
}
