using Dapper;
using PharmacyApi.DTO;
using PharmacyApi.Models;
using PharmacyApi.Repository.Dapper.Interface;
using System.Data;

namespace PharmacyApi.Repository.Dapper.Implement
{
    public class MedicineReadRepo : IMedicineReadRepo
    {
        private readonly IDbConnection _db;
        public MedicineReadRepo(IDbConnection db)
        {
            _db = db;
        }
        public async Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync() =>
            await _db.QueryAsync<MedicineDto>("SELECT * FROM Medicines");

        public async Task<MedicineDto> GetMedicineByIdAsync(int medicineId) =>
            await _db.QueryFirstOrDefaultAsync<MedicineDto>("SELECT * FROM Medicines WHERE MedicineId = @Id", new { Id = medicineId });

        public async Task<int> GetMedicineCount()
        {
            var count = await _db.QuerySingleAsync<int>("SELECT COUNT(*) FROM Medicines");
            return count;
        }
    }
}
