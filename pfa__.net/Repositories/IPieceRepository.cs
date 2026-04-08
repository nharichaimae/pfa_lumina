using pfa__.net.DTO;
using pfa__.net.Models;

namespace pfa__.net.Repositories
{
    public interface IPieceRepository
    {
        Task<int> AddPieceAsync(Piece piece);
        Task<List<Piece>> ListerPiece(int userId);
        Task<bool> SupprimerPieceAsync(int pieceId);
        Task<List<PieceType>> GetPieceTypesAsync();
        //duplicate
        Task<int> DuplicatePieceAsync(int pieceId, int userId);



    }
}
