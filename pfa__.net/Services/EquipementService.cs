using pfa__.net.Data;
using pfa__.net.Models;
using Microsoft.EntityFrameworkCore;
namespace pfa__.net.Services
{
    public class EquipementService
    {
        private readonly AppDbContext _context;

        public EquipementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Equipement?> FindEquipement(string text, int? numeroChambre)
        {
            var equipements = await _context.Equipements
                .Include(e => e.Piece)
                .ToListAsync();

            foreach (var e in equipements)
            {
                var pieceNom = e.Piece.Nom?.ToUpper() ?? "";
                var equipNom = e.Nom?.ToUpper() ?? "";

                bool matchPiece = numeroChambre.HasValue
                    ? pieceNom.Contains(numeroChambre.Value.ToString())
                    : text.Contains(pieceNom);

                bool matchEquip = text.Contains(equipNom);

                if (matchPiece && matchEquip)
                    return e;
            }

            return null;
        }

        public async Task UpdateEtat(Equipement equipement, string command)
        {
            equipement.Etat = command;
            await _context.SaveChangesAsync();
        }
    }
}
