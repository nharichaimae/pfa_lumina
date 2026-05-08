using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace pfa__.net.Models
{
    [Table("regle")]
    public class Regle
    {
        [Key]
        [Column("id_regle")]
        public int IdRegle { get; set; }

        [Column("dateRegle")]
        public DateTime? DateRegle { get; set; }

        [Column("heureDebut")]
        public TimeSpan HeureDebut { get; set; }

        [Column("heureFin")]
        public TimeSpan HeureFin { get; set; }

        [Column("id_equipement")]
        public int IdEquipement { get; set; }

        [Column("chaque_jour")]
        public bool ChaqueJour { get; set; } = false;

        [ForeignKey("IdEquipement")]
        public Equipement? Equipement { get; set; }

        // ✅ Cette ligne doit être présente
        public ICollection<ConditionHistorique>? ConditionHistoriques { get; set; }
            = new List<ConditionHistorique>();
    }
}