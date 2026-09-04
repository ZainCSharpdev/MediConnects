using PharmacyApi.Models;
using PharmacyApi.Repository.Entity.Interface;

namespace PharmacyApi.Repository.Entity.Implement
{
    public class UserWriteRepo(PharmacyDbContext _context) : IUserWriteRepo
    {
        public async Task AddUserAsync(User user)
        {
           _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }


        public async Task UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}
