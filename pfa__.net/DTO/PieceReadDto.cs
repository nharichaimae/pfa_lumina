namespace pfa__.net.DTO
{
    public class PieceReadDto
    {
     
            public int Id { get; set; }
            public string Nom { get; set; }
        public string TypeNom { get; set; }
        public string Icon { get; set; }
        public List<EquipementReadDto> Equipements { get; set; }
        
    }
}
