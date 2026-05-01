using pfa__.net.Models;

namespace pfa__.net.Repositories
{
    public interface IConditionRepository
    {
        Task<List<ConditionHistorique>> GetAllAsync();
        Task<List<ConditionHistorique>> GetByRegleIdAsync(int idRegle);
        Task<ConditionHistorique?> GetByIdAsync(int id);
        Task<ConditionHistorique> CreateAsync(ConditionHistorique condition);
        Task<List<ConditionHistorique>> GetByEquipementIdAsync(int idEquipement);
        Task<bool> DeleteAsync(int id);
    }
}