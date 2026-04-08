using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace pfa__.net.Models
{
    [Table("equipement_type")]
    public class EquipementType
    {
        [Key]
        [Column("id_type")]
        public int id_type { get; set; }

        [Column("nom")]
        public string Nom { get; set; } = string.Empty;

        [Column("icon")]
        public string Icon { get; set; } = string.Empty;
    }
}