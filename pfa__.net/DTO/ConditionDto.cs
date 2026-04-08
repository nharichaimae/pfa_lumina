namespace pfa__.net.DTO
{
    public class ConditionDto
    {
        public int Id { get; set; }
        public int IdEquipement { get; set; }
        public string NomEquipement { get; set; } = string.Empty;
        public string TypeEquipement { get; set; } = string.Empty;
        public int IdRegle { get; set; }
        public string HeureDebut { get; set; } = string.Empty;
        public string HeureFin { get; set; } = string.Empty;
        public string Valeur { get; set; } = string.Empty;
        public DateTime DateHeure { get; set; }
        public string Source { get; set; } = string.Empty; // ✅ NOUVEAU
    }
}