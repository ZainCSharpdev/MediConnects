using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PharmacyApi.DTO;
using PharmacyApi.Models;
using PharmacyApi.Repository.Dapper.Interface;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Services.Medicine
{
    public class MedicineService
    {
        private readonly IMedicineReadRepo _readRepo;
        private readonly IMedicineWriteRepo _writeRepo;
        private readonly ISupplierReadRepo _supplierReadRepo;
        private readonly IMongoCollection<MongoMedicine> _mongoCollection;

        public MedicineService(
            IMedicineReadRepo readRepo,
            IMedicineWriteRepo writeRepo,
            IMongoClient mongoClient,
            ISupplierReadRepo supplierReadRepo,
            IOptions<MongoDbSettings> settings)
        {
            _readRepo = readRepo;
            _writeRepo = writeRepo;
            _supplierReadRepo = supplierReadRepo;
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _mongoCollection = database.GetCollection<MongoMedicine>(settings.Value.ProductCollectionName);
        }

        // ✅ SQL only
        public async Task<IEnumerable<MedicineDto>> GetAllMedicinesAsync()
        {
            return await _readRepo.GetAllMedicinesAsync();
        }

        public async Task<MedicineDto> GetMedicineByIdAsync(int medicineId)
        {
            return await _readRepo.GetMedicineByIdAsync(medicineId);
        }

        public async Task<int> GetMedicineCount()
        {
            return await _readRepo.GetMedicineCount();
        }
        public async Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync()
        {
            return await _supplierReadRepo.GetAllSuppliersAsync();
        }

        // ✅ Combined search: SQL + Mongo
        public async Task<IEnumerable<SearchMedicineResultDto>> SearchMedicineByNameAsync(string term)
        {
            // SQL search
            var sqlMedicines = await _readRepo.GetAllMedicinesAsync();
            var sqlMatches = sqlMedicines
                .Where(m => m.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
                .Take(5)
                .Select(m => new SearchMedicineResultDto
                {
                    Id = m.MedicineId.ToString(),
                    Name = m.Name,
                    Price = m.Price.ToString("0.00"),
                    pack_size_label = m.pack_size_label.ToString(),
                    Manufacturer = "",
                    Category = m.Category,
                    StockQuantity = m.StockQuantity.ToString()
                });

            // Mongo search
            var filter = Builders<MongoMedicine>.Filter.Regex(
                m => m.Name,
                new MongoDB.Bson.BsonRegularExpression(term, "i")
            );

            var mongoMatches = await _mongoCollection.Find(filter).Limit(20).ToListAsync();
            var mongoResults = mongoMatches.Select(m => new SearchMedicineResultDto
            {
                Id = m.Id,
                Name = m.Name,
                Price = m.Price,
                Manufacturer = m.ManufacturerName,
                Category = m.Type,
                StockQuantity = 0.ToString()
            });

            return sqlMatches.Concat(mongoResults).Take(25);
        }


        // ✅ SQL only
        public async Task AddMedicineAsync(MedicineDto dto)
        {
            await _writeRepo.AddMedicineAsync(dto);
        }

        public async Task<MedicineDto> UpdateMedicineAsync(MedicineDto dto)
        {
            await _writeRepo.UpdateMedicineAsync(dto);
            return dto;
        }

        public async Task DeleteMedicineAsync(int medicineId)
        {
            await _writeRepo.DeleteMedicineAsync(medicineId);
        }
    }
}
