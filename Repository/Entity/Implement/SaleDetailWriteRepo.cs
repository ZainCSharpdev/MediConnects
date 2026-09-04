using PharmacyApi.DTO;
using PharmacyApi.Models;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Repository.Entity.Implement
{
    public class SaleDetailWriteRepo(PharmacyDbContext _context) : ISaleDetailsWriteRepo
    {
        public async Task AddSaleDetailAsync(SaleDetailDto dto)
        {
            var entity = new SaleDetail
            {
                SaleId = dto.SaleId,
                MedicineId = dto.MedicineId,
                Qty = dto.Qty,
                UnitPrice = dto.UnitPrice
            };

            _context.SaleDetails.Add(entity);

            // Reduce stock
            var medicine = await _context.Medicines.FindAsync(dto.MedicineId);
            if (medicine != null)
            {
                medicine.StockQuantity -= dto.Qty;
            }

            await _context.SaveChangesAsync();
            dto.SaleDetailId = entity.SaleDetailId;
            dto.TotalPrice = dto.Qty * dto.UnitPrice;
        }

        public async Task UpdateSaleDetailAsync(SaleDetailDto dto)
        {
            var entity = await _context.SaleDetails.FindAsync(dto.SaleDetailId);
            if (entity == null) return;

            // Adjust stock if quantity changed
            var medicine = await _context.Medicines.FindAsync(entity.MedicineId);
            if (medicine != null)
            {
                var diff = dto.Qty - entity.Qty;
                medicine.StockQuantity -= diff;
            }

            entity.Qty = dto.Qty;
            entity.UnitPrice = dto.UnitPrice;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteSaleDetailAsync(int id)
        {
            var entity = await _context.SaleDetails.FindAsync(id);
            if (entity == null) return;

            // Restore stock
            var medicine = await _context.Medicines.FindAsync(entity.MedicineId);
            if (medicine != null)
            {
                medicine.StockQuantity += entity.Qty;
            }

            _context.SaleDetails.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}

