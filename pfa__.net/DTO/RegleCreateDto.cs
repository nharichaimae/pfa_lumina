namespace pfa__.net.DTO
{
    public class RegleCreateDto
    {
        public DateTime? DateRegle { get; set; }
        public string HeureDebut { get; set; } = string.Empty;
        public string HeureFin { get; set; } = string.Empty;
        public int IdEquipement { get; set; }
        public bool ChaqueJour { get; set; } = false;
    }
}