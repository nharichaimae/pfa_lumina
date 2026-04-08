using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace pfa__.net.Models
{
    [Table("piece_type")]
    public class PieceType
    {
        [Key]
        [Column("id_type")]
        public int id_type { get; set; }

        [Column("nom")]
        public string Nom { get; set; } = string.Empty;

        [Column("icon")]
        public string Icon { get; set; } = string.Empty;

        public ICollection<Piece> Pieces { get; set; } = new List<Piece>();
    }
}