using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
namespace PharmacyApi.Models
{
    public class MongoMedicine
    {
        [BsonId]
        public ObjectId _id { get; set; }

        [BsonElement("id")]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("price(₹)")]
        public string Price { get; set; }

        [BsonElement("Is_discontinued")]
        public string IsDiscontinued { get; set; }

        [BsonElement("manufacturer_name")]
        public string ManufacturerName { get; set; }

        [BsonElement("type")]
        public string Type { get; set; }

        [BsonElement("pack_size_label")]
        public string PackSizeLabel { get; set; }

        [BsonElement("short_composition1")]
        public string ShortComposition1 { get; set; }

        [BsonElement("short_composition2")]
        public string ShortComposition2 { get; set; }

    }
}
