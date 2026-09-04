using PharmacyApi.Models;

namespace PharmacyApi.Repository.Dapper.Interface
{
    public interface IUserReadRepo
    {
        Task<User?> GetUserByEmailAsync(string email);
    }
}
