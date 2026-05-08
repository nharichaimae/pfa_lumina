using pfa__.net.Models;
using pfa__.net.DTO;

public static class RegleMapper
{
    public static RegleDto ToDto(Regle regle)
    {
        if (regle == null) return null;

        return new RegleDto
        {
            IdRegle = regle.IdRegle,
            DateRegle = regle.DateRegle,

            HeureDebut = regle.HeureDebut.ToString(@"hh\:mm"),
            HeureFin = regle.HeureFin.ToString(@"hh\:mm"),

            IdEquipement = regle.IdEquipement,

            NomEquipement = regle.Equipement?.Nom ?? "N/A",

          TypeEquipement = regle.Equipement?.Etat ?? "",
          

            ChaqueJour = regle.ChaqueJour
        };
    }

    public static Regle ToModel(RegleCreateDto dto)
    {
        if (dto == null) return null;

        return new Regle
        {
            DateRegle = dto.ChaqueJour ? null : dto.DateRegle,

            HeureDebut = ParseTime(dto.HeureDebut),
            HeureFin = ParseTime(dto.HeureFin),

            IdEquipement = dto.IdEquipement,
            ChaqueJour = dto.ChaqueJour
        };
    }

    public static List<RegleDto> ToDtoList(IEnumerable<Regle> regles)
    {
        return regles?.Select(ToDto).ToList() ?? new List<RegleDto>();
    }

    private static TimeSpan ParseTime(string time)
    {
        if (TimeSpan.TryParse(time, out var result))
            return result;

        throw new FormatException("Format heure invalide");
    }
}