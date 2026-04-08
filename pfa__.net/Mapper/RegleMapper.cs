using pfa__.net.Models;
using pfa__.net.DTO;

namespace pfa__.net.Mapper
{
    public static class RegleMapper
    {
        public static RegleDto ToDto(Regle regle)
        {
            return new RegleDto
            {
                IdRegle        = regle.IdRegle,
                DateRegle      = regle.DateRegle,
                HeureDebut     = regle.HeureDebut,
                HeureFin       = regle.HeureFin,
                IdEquipement   = regle.IdEquipement,
                NomEquipement  = regle.Equipement?.Nom ?? string.Empty,
                TypeEquipement = regle.Equipement?.Etat ?? string.Empty,
                ChaqueJour     = regle.ChaqueJour
            };
        }

        public static Regle ToModel(RegleCreateDto dto)
        {
            return new Regle
            {
                DateRegle    = dto.ChaqueJour ? null : dto.DateRegle,
                HeureDebut   = dto.HeureDebut,
                HeureFin     = dto.HeureFin,
                IdEquipement = dto.IdEquipement,
                ChaqueJour   = dto.ChaqueJour
            };
        }

        public static List<RegleDto> ToDtoList(IEnumerable<Regle> regles)
        {
            return regles.Select(ToDto).ToList();
        }
    }
}