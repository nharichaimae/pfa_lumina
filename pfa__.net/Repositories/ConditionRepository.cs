using Microsoft.EntityFrameworkCore;
using pfa__.net.Data;
using pfa__.net.Models;

namespace pfa__.net.Repositories
{
    public class ConditionRepository : IConditionRepository
    {
        private readonly AppDbContext _context;

        public ConditionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ConditionHistorique>> GetAllAsync()
        {
            return await _context.ConditionHistoriques
                .Include(c => c.Regle)
                .OrderByDescending(c => c.DateHeure)
                .ToListAsync();
        }

        public async Task<List<ConditionHistorique>> GetByRegleIdAsync(int idRegle)
        {
            return await _context.ConditionHistoriques
                .Include(c => c.Regle)
                .Where(c => c.IdRegle == idRegle)
                .OrderByDescending(c => c.DateHeure)
                .ToListAsync();
        }

        // ✅ MÉTHODE MANQUANTE
        public async Task<List<ConditionHistorique>> GetByEquipementIdAsync(int idEquipement)
        {
            return await _context.ConditionHistoriques
                .Include(c => c.Regle)
                .Where(c => c.Regle.IdEquipement == idEquipement)
                .OrderByDescending(c => c.DateHeure)
                .ToListAsync();
        }

        public async Task<ConditionHistorique?> GetByIdAsync(int id)
        {
            return await _context.ConditionHistoriques
                .Include(c => c.Regle)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<ConditionHistorique> CreateAsync(ConditionHistorique condition)
        {
            condition.DateHeure = DateTime.Now;
            _context.ConditionHistoriques.Add(condition);
            await _context.SaveChangesAsync();
            return condition;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var condition = await _context.ConditionHistoriques.FindAsync(id);
            if (condition == null) return false;
            _context.ConditionHistoriques.Remove(condition);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}