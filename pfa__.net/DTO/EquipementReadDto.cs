namespace pfa__.net.DTO
{
    public class EquipementReadDto
    {
        public int Id { get; set; }
        public string Nom { get; set; }

        public string Etat { get; set; }
        public string TypeNom { get; set; } = "";
        public string Icon { get; set; } = "";
    }
}
