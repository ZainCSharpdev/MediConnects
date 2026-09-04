namespace PharmacyApi.Models
{
    public class MongoDbSettings
    {
        public string mongoDbConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string ProductCollectionName { get; set; } = string.Empty;
    }
}
