using Microsoft.EntityFrameworkCore;
using PharmacyApi.DTO;
using PharmacyApi.Models;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Repository.Entity.Implement
{
    public class SaleWriteRepo(PharmacyDbContext _context) : ISaleWriteRepo
    {
        public async Task<int> AddSaleAsync(SaleCreateDto dto,List<SalesDetailCreateDto> details)
        {
            var today = DateTime.Now;
            var dayPart = today.ToString("dd");
            var countForDay = await _context.Sales.CountAsync(s => s.SaleDate.Date == today.Date) + 1;
            var sale = new Sale
            {
                SaleDate = today,
                Invoice = $"INV-{dayPart}-{countForDay:D2}",
                CustomerName = dto.CustomerName,
                Discount = dto.Discount,
                Method = dto.Method,
                SaleDetails = new List<SaleDetail>()
            };
            decimal total = 0;

            foreach(var d in details)
            {
                var medicine = await _context.Medicines.FindAsync(d.MedicineId);
                if(medicine == null) throw new Exception("Medicine not found");
                if(medicine.StockQuantity < d.Qty) throw new Exception($"Not enough stock for medicine {medicine.Name}");
                medicine.StockQuantity -= d.Qty;

                var detail = new SaleDetail
                {
                    MedicineId = d.MedicineId,
                    Qty = d.Qty,
                    UnitPrice = d.UnitPrice,
                    TotalPrice = d.Qty * d.UnitPrice
                };
                sale.SaleDetails.Add(detail);
                total += (decimal)detail.TotalPrice;
            }

            sale.TotalAmount = total;
            sale.NetAmount = total - dto.Discount;

            await _context.Sales.AddAsync(sale);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
            return sale.SaleId;
        }

        public async Task<int> UpdateSaleAsync(SaleDto dto)
        {
            var sale = await _context.Sales
                .Include(s=> s.SaleDetails)
                .FirstOrDefaultAsync(s => s.SaleId == dto.SaleId);

            if (sale == null) return 0;

            sale.CustomerName = dto.CustomerName;
            sale.Discount = dto.Discount;
            sale.Method = dto.Method;
            sale.TotalAmount = sale.SaleDetails.Sum(d => d.Qty * d.UnitPrice);
            sale.NetAmount = sale.TotalAmount - dto.Discount;

            return await _context.SaveChangesAsync();
        }

        public async Task<int> DeleteSaleAsync(int saleId)
        {
            var sale = await _context.Sales
                .Include(s => s.SaleDetails)
                .FirstOrDefaultAsync(s => s.SaleId == saleId);
            if (sale == null) return 0;
            foreach (var detail in sale.SaleDetails)
            {
                var medicine = await _context.Medicines.FindAsync(detail.MedicineId);
                if (medicine != null)
                {
                    medicine.StockQuantity += detail.Qty;
                }
            }
            _context.Sales.Remove(sale);
            return await _context.SaveChangesAsync();
        }
    }
}
