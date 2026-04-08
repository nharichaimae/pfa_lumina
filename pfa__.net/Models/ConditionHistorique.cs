using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace pfa__.net.Models
{
    [Table("condition_historique")]
    public class ConditionHistorique
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("id_regle")]
        public int IdRegle { get; set; }

        [Column("valeur")]
        public string Valeur { get; set; } = string.Empty;

        [Column("date_heure")]
        public DateTime DateHeure { get; set; }

        [Column("source")]
        public string Source { get; set; } = "auto";

        [ForeignKey("IdRegle")]
        public Regle Regle { get; set; }
    }
}