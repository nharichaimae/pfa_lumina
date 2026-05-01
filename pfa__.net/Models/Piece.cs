using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace pfa__.net.Models
{
    [Table("piece")]
    public class Piece
    {
        [Key]
        [Column("id_piece")]
        public int Id_Piece { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("nom")]
        public string Nom { get; set; } = string.Empty;

        [Column("type_id")]
        public int type_id { get; set; }

        [ForeignKey(nameof(type_id))]
        public PieceType PieceType { get; set; } 

        // user id 
        [Column("id")]
        public int? Id { get; set; }

        public ICollection<Equipement> Equipements { get; set; } = new List<Equipement>();
    }
}