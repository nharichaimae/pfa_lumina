using pfa__.net.Models;
using System.Threading.Tasks;

namespace pfa__.net.Repositories
{
    public interface IEquipementRepository
    {
        Task<int> AddEquipementAsync(Equipement equipement);
        Task<bool> SupprimerEquipementAsync(int equipId);
        Task<List<EquipementType>> GetEquipementTypesAsync();
    }
}