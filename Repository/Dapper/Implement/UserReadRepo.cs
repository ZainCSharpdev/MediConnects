using PharmacyApi.Models;
using PharmacyApi.Repository.Dapper.Interface;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace PharmacyApi.Repository.Dapper.Implement
{
    public class UserReadRepo(PharmacyDbContext _context) : IUserReadRepo
    {
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
