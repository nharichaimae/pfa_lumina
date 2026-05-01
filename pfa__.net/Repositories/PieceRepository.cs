using Microsoft.EntityFrameworkCore;
using pfa__.net.Data;
using pfa__.net.DTO;
using pfa__.net.Models;
using pfa__.net.Repositories;

namespace pfa__.net.Repositories
{
    public class PieceRepository : IPieceRepository
    {
        private readonly AppDbContext _context;

        public PieceRepository(AppDbContext context)
        {
            _context = context;
        }

        // Ajouter une pièce
        public async Task<int> AddPieceAsync(Piece piece)
        {
            _context.Pieces.Add(piece);
            await _context.SaveChangesAsync();
            return piece.Id_Piece;
        }

        public async Task<List<Piece>> ListerPiece(int userId)
        {

            return await _context.Pieces
                     .Where(p => p.Id == userId)
                      .Include(p => p.PieceType)
                     .Include(p => p.Equipements)
                     .ThenInclude(e => e.EquipementType)
                     .ToListAsync();


        }
        public async Task<bool> SupprimerPieceAsync(int pieceId)
        {
            var piece = await _context.Pieces.FindAsync(pieceId);

            if (piece == null)
                return false;

            _context.Pieces.Remove(piece);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<List<PieceType>> GetPieceTypesAsync()
        {
            return await _context.PieceTypes.ToListAsync();
        }

        //duplicate 

        public async Task<int> DuplicatePieceAsync(int pieceId, int userId)
        {
            // Charger la pièce originale avec ses équipements
            var original = await _context.Pieces
                .Include(p => p.Equipements)
                .FirstOrDefaultAsync(p => p.Id_Piece == pieceId);

            if (original == null) throw new Exception("Pièce introuvable");


            var baseName = System.Text.RegularExpressions.Regex.Replace(original.Nom, @"\s+\d+$", "").Trim();
            var existingNames = await _context.Pieces
                .Where(p => p.Id == userId && p.Nom.StartsWith(baseName))
                .Select(p => p.Nom)
                .ToListAsync();

            int suffix = 2;
            string newName;
            do
            {
                newName = $"{baseName} {suffix}";
                suffix++;
            } while (existingNames.Contains(newName));

            // Créer la nouvelle pièce
            var newPiece = new Piece
            {
                Nom = newName,
                type_id = original.type_id,
                Id = userId,
                Equipements = original.Equipements.Select(e => new Equipement
                {
                    Nom = e.Nom,
                    Description = e.Description,
                    Etat = e.Etat,
                    type_id = e.type_id
                }).ToList()
            };

            _context.Pieces.Add(newPiece);
            await _context.SaveChangesAsync();

            return newPiece.Id_Piece;
        }

    }
}
