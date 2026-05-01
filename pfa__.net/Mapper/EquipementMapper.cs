using pfa__.net.DTO;
using pfa__.net.Models;

namespace pfa__.net.Mapper
{
    public static class EquipementMapper
    {
        public static Equipement ToEquipement(AddEquipementDto dto)
        {
            return new Equipement
            {
                Nom = dto.Nom,
                Description = dto.Description,
                Etat = dto.Etat,
                Id_Piece = dto.Id_Piece,
                type_id = dto.type_id

            };
        }
        public static EquipementReadDto ToDto(Equipement equipement)
        {
            return new EquipementReadDto
            {
                Id = equipement.Id_Equipement,
                Nom = equipement.Nom,
                Etat = equipement.Etat,
                TypeNom = equipement.EquipementType != null ? equipement.EquipementType.Nom : "",
                Icon = equipement.EquipementType != null ? equipement.EquipementType.Icon : ""
            };
        }
    }
}
