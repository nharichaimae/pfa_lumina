namespace pfa__.net.DTO
{
    public class AddEquipementDto
    {
        public string Nom { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Etat { get; set; } = "Off"; 
        public int Id_Piece { get; set; }
        public int type_id { get; set; }
    }
}
