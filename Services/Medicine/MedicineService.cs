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

        // ✅ Combined search: SQL + Mongo with Supplier-to-Manufacturer mapping
        public async Task<IEnumerable<SearchMedicineResultDto>> SearchMedicineByNameAsync(string term)
        {
            string searchTerm = term ?? string.Empty;

            // 1. Fetch all suppliers once and map them into a Dictionary for O(1) quick lookups
            var suppliers = await _supplierReadRepo.GetAllSuppliersAsync();
            var supplierDict = suppliers != null
                ? suppliers.ToDictionary(s => s.SupplierId.ToString(), s => s.SupplierName)
                : new Dictionary<string, string>();

            // 2. SQL search
            var sqlMedicines = await _readRepo.GetAllMedicinesAsync();
            var sqlMatches = sqlMedicines
                .Where(m => string.IsNullOrEmpty(searchTerm) || m.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                .Take(5)
                .Select(m =>
                {
                    string supplierKey = m.SupplierId?.ToString();
                    string resolvedManufacturer = string.Empty;

                    // Map Supplier Name as Manufacturer if SupplierId matches
                    if (supplierKey != null && supplierDict.ContainsKey(supplierKey))
                    {
                        resolvedManufacturer = supplierDict[supplierKey];
                    }

                    return new SearchMedicineResultDto
                    {
                        Id = m.MedicineId.ToString(),
                        Name = m.Name ?? string.Empty,
                        Price = m.Price.ToString("0.00"),
                        pack_size_label = m.pack_size_label.ToString() ?? string.Empty,
                        Manufacturer = resolvedManufacturer,
                        Category = m.Category ?? string.Empty,
                        StockQuantity = m.StockQuantity.ToString()
                    };
                });

            // 3. Mongo search
            var filter = string.IsNullOrEmpty(searchTerm)
                ? Builders<MongoMedicine>.Filter.Empty
                : Builders<MongoMedicine>.Filter.Regex(
                    m => m.Name,
                    new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")
                );

            var mongoMatches = await _mongoCollection.Find(filter).Limit(15).ToListAsync();
            var mongoResults = mongoMatches.Select(m => new SearchMedicineResultDto
            {
                Id = m.Id ?? m._id.ToString(),
                Name = m.Name ?? string.Empty,
                Price = m.Price ?? "0.00",
                pack_size_label = m.PackSizeLabel ?? string.Empty,
                Manufacturer = m.ManufacturerName ?? string.Empty,
                Category = m.Type ?? string.Empty,
                StockQuantity = "0"
            });

            // 4. Combine results and cap at 25 items total
            return sqlMatches.Concat(mongoResults).Take(25);
        }

        // ✅ SQL only
        public async Task AddMedicineAsync(MedicineDto dto)
        {
            await _writeRepo.AddMedicineAsync(dto);
        }

        public async Task<MedicineDto> UpdateMedicineAsync(MedicineDto dto, int MedicineId)
        {
            await _writeRepo.UpdateMedicineAsync(dto, MedicineId);
            return dto;
        }

        public async Task DeleteMedicineAsync(int MedicineId)
        {
            await _writeRepo.DeleteMedicineAsync(MedicineId);
        }
    }
}