using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace pfa__.net.Models
{
    [Table("equipement")]
    public class Equipement
    {
        [Key]
        public int Id_Equipement { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nom { get; set; }

        [MaxLength(255)]
        public string Description { get; set; }

        [MaxLength(50)]
        public string Etat { get; set; }

        public int Id_Piece { get; set; }

        [ForeignKey("Id_Piece")]
        public Piece Piece { get; set; }

        [Column("type_id")]
        public int type_id { get; set; }

        public EquipementType EquipementType { get; set; }

        public ICollection<Regle> Regles { get; set; } = new List<Regle>();
        // ✅ Supprimé ConditionHistoriques — relation via Regle
    }
}