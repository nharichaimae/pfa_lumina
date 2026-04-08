using pfa__.net.Models;
using pfa__.net.DTO;

namespace pfa__.net.Mapper
{
    public static class ConditionMapper
    {
        public static ConditionDto ToDto(ConditionHistorique condition)
        {
            return new ConditionDto
            {
                Id             = condition.Id,
                IdEquipement   = condition.Regle?.IdEquipement ?? 0,
                NomEquipement  = condition.Regle?.Equipement?.Nom ?? string.Empty,
                TypeEquipement = condition.Regle?.Equipement?.Etat ?? string.Empty,
                IdRegle        = condition.IdRegle,
                HeureDebut     = condition.Regle?.HeureDebut ?? string.Empty,
                HeureFin       = condition.Regle?.HeureFin ?? string.Empty,
                Valeur         = condition.Valeur,
                DateHeure      = condition.DateHeure,
                Source         = condition.Source
            };
        }

        public static List<ConditionDto> ToDtoList(IEnumerable<ConditionHistorique> conditions)
        {
            return conditions.Select(ToDto).ToList();
        }
    }
}