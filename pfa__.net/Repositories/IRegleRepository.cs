using pfa__.net.Models;

namespace pfa__.net.Repositories
{
    public interface IRegleRepository
    {
        Task<List<Regle>> GetAllWithEquipementAsync();
        Task<List<Regle>> GetByEquipementIdAsync(int idEquipement);
        Task<Regle?> GetByIdAsync(int id);
        Task<Regle> CreateAsync(Regle regle);
        Task<bool> DeleteAsync(int id);
    }
}