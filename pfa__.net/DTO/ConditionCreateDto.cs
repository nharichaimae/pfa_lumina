namespace pfa__.net.DTO
{
    public class ConditionCreateDto
    {
        public int IdEquipement { get; set; }
        public string NomEquipement { get; set; } = string.Empty; // ✅ ajouter
        public string Valeur { get; set; } = string.Empty;
        public string DateHeure { get; set; } = string.Empty;     // ✅ ajouter
    }
}