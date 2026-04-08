using pfa__.net.Data;
using pfa__.net.Models;
using Microsoft.EntityFrameworkCore;

namespace pfa__.net.Jobs
{
    public class RegleJob
    {
        private readonly AppDbContext _context;

        public RegleJob(AppDbContext context)
        {
            _context = context;
        }

        public async Task ExecuterRegles()
        {
            var now = DateTime.Now;
            var aujourdHui = DateTime.Today;
            int maintenant = now.Hour * 60 + now.Minute;

            Console.WriteLine($"[RegleJob] ⏰ {now:HH:mm} ({maintenant} min)");

            var toutesRegles = await _context.Regles
                .Include(r => r.Equipement)
                .Where(r =>
                    r.ChaqueJour == true ||
                    (r.DateRegle.HasValue && r.DateRegle.Value.Date == aujourdHui))
                .ToListAsync();

            var regles = toutesRegles
                .GroupBy(r => r.IdEquipement)
                .Select(g => g.OrderByDescending(r => r.IdRegle).First())
                .ToList();

            Console.WriteLine($"[RegleJob] {regles.Count} équipements actifs");

            foreach (var regle in regles)
            {
                // ✅ string -> TimeSpan -> minutes
                var tsDebut = TimeSpan.Parse(regle.HeureDebut);
                var tsFin   = TimeSpan.Parse(regle.HeureFin);
                int debut   = (int)tsDebut.TotalMinutes;
                int fin     = (int)tsFin.TotalMinutes;

                Console.WriteLine($"[RegleJob] {regle.Equipement?.Nom} | debut={debut}min fin={fin}min now={maintenant}min");

                string? valeurAttendue = null;

                if (maintenant == debut)
                {
                    var derniereManuelle = await _context.ConditionHistoriques
                        .Include(c => c.Regle)
                        .Where(c => c.Regle.IdEquipement == regle.IdEquipement
                                 && c.Source == "manuel")
                        .OrderByDescending(c => c.DateHeure)
                        .FirstOrDefaultAsync();

                    valeurAttendue = derniereManuelle?.Valeur ?? "ON";
                    Console.WriteLine($"[RegleJob] → heureDebut atteinte ! valeur={valeurAttendue}");
                }
                else if (maintenant == fin)
                {
                    var derniereCondition = await _context.ConditionHistoriques
                        .Include(c => c.Regle)
                        .Where(c => c.Regle.IdEquipement == regle.IdEquipement)
                        .OrderByDescending(c => c.DateHeure)
                        .FirstOrDefaultAsync();

                    valeurAttendue = (derniereCondition?.Valeur == "ON") ? "OFF" : "ON";
                    Console.WriteLine($"[RegleJob] → heureFin atteinte ! valeur={valeurAttendue}");
                }
                else
                {
                    Console.WriteLine($"[RegleJob] → skip");
                    continue;
                }

                var derniereAutoRegle = await _context.ConditionHistoriques
                    .Where(c => c.IdRegle == regle.IdRegle && c.Source == "auto")
                    .OrderByDescending(c => c.DateHeure)
                    .FirstOrDefaultAsync();

                bool doitCreer = derniereAutoRegle == null ||
                                 (DateTime.Now - derniereAutoRegle.DateHeure).TotalMinutes >= 1;

                Console.WriteLine($"[RegleJob] doitCreer={doitCreer} (derniere auto: {derniereAutoRegle?.DateHeure})");

                if (doitCreer)
                {
                    var nouvelleCondition = new ConditionHistorique
                    {
                        IdRegle   = regle.IdRegle,
                        Valeur    = valeurAttendue,
                        DateHeure = DateTime.Now,
                        Source    = "auto"
                    };

                    _context.ConditionHistoriques.Add(nouvelleCondition);
                    await _context.SaveChangesAsync();

                    Console.WriteLine($"[RegleJob] ✅✅ CRÉÉ → {regle.Equipement?.Nom} = {valeurAttendue}");
                }
                else
                {
                    Console.WriteLine($"[RegleJob] doublon ignoré");
                }
            }
        }
    }
}