using System.ComponentModel.DataAnnotations;

namespace pfa__.net.DTO
{
    public class RegleCreateDto
    {
        public DateTime? DateRegle { get; set; }

        [Required]
        public string HeureDebut { get; set; } = string.Empty;

        [Required]
        public string HeureFin { get; set; } = string.Empty;

        [Required]
        public int IdEquipement { get; set; }

        public bool ChaqueJour { get; set; } = false;
    }
}