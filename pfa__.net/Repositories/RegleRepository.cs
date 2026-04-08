using Microsoft.EntityFrameworkCore;
using pfa__.net.Data;
using pfa__.net.Models;

namespace pfa__.net.Repositories
{
    public class RegleRepository : IRegleRepository
    {
        private readonly AppDbContext _context;

        public RegleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Regle>> GetAllWithEquipementAsync()
        {
            return await _context.Regles
                .Include(r => r.Equipement)
                .ToListAsync();
        }

        public async Task<List<Regle>> GetByEquipementIdAsync(int idEquipement)
        {
            return await _context.Regles
                .Include(r => r.Equipement)
                .Where(r => r.IdEquipement == idEquipement)
                .ToListAsync();
        }

        public async Task<Regle?> GetByIdAsync(int id)
        {
            return await _context.Regles
                .Include(r => r.Equipement)
                .FirstOrDefaultAsync(r => r.IdRegle == id);
        }

        public async Task<Regle> CreateAsync(Regle regle)
        {
            _context.Regles.Add(regle);
            await _context.SaveChangesAsync();
            return regle;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var regle = await _context.Regles.FindAsync(id);
            if (regle == null) return false;
            _context.Regles.Remove(regle);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}