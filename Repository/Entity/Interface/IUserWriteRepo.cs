using PharmacyApi.Models;

namespace PharmacyApi.Repository.Entity.Interface
{
    public interface IUserWriteRepo
    {
        Task AddUserAsync(User user);
        Task UpdateUserAsync(User user);
    }
}
