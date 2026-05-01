using pfa__.net.Data;
using pfa__.net.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace pfa__.net.Repositories
{
    public class EquipementRepository : IEquipementRepository
    {
        private readonly AppDbContext _context;

        public EquipementRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddEquipementAsync(Equipement equipement)
        {
            _context.Equipements.Add(equipement);
            await _context.SaveChangesAsync();
            return equipement.Id_Equipement;
        }
        public async Task<bool> SupprimerEquipementAsync(int equipId)
        {
            var equipement = await _context.Equipements.FindAsync(equipId);

            if (equipement == null)
                return false;

            _context.Equipements.Remove(equipement);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<List<EquipementType>> GetEquipementTypesAsync()
        {
            return await _context.EquipementTypes.ToListAsync();
        }
    }
}
