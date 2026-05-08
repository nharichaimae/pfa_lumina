using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using pfa__.net.Data;
using pfa__.net.DTO;
using pfa__.net.Mapper;
using pfa__.net.Repositories;

namespace pfa__.net.Controllers
{
    [ApiController]
    [Route("api")]
    public class EquipementController : ControllerBase
    {
        private readonly IEquipementRepository _equipementRepository;
        private readonly AppDbContext _context;

        public EquipementController(IEquipementRepository equipementRepository, AppDbContext context)
        {
            _equipementRepository = equipementRepository;
            _context = context;
        }

        // Ajouter un équipement pour une pièce spécifique
        [HttpPost("piece/{pieceId}/equipement")]
        public async Task<IActionResult> AddEquipement(int pieceId, [FromBody] AddEquipementDto dto)
        {
            var equipement = EquipementMapper.ToEquipement(dto);
            equipement.Id_Piece = pieceId;

            int newEquipementId = await _equipementRepository.AddEquipementAsync(equipement);

            return Ok(new
            {
                message = "Équipement ajouté",
                equipementId = newEquipementId,
                pieceId = pieceId
            });
        }

        [HttpDelete("equipement/{id}")]
        public async Task<IActionResult> SupprimerEquipe(int id)
        {
            var result = await _equipementRepository.SupprimerEquipementAsync(id);

            if (!result)
                return NotFound(new { message = "Equipement non trouvé" });

            return NoContent();
        }

        // ✅ GET api/equipementtypes
[HttpGet("equipementtypes")]
public async Task<IActionResult> GetEquipementTypes()
{
    var types = await _context.EquipementTypes.ToListAsync();
    var result = types.Select(t => new
    {
        id_type = t.id_type,
        nom   = t.Nom,
        nomFr = t.NomFr,   
        nomEn = t.NomEn,  
        icon  = t.Icon
    });
    return Ok(result);
}
        [HttpPut("equipement/{id}/etat")]
        public async Task<IActionResult> UpdateEtat(int id, [FromBody] UpdateEtatDto dto)
        {
            var equip = await _context.Equipements.FindAsync(id);

            if (equip == null)
                return NotFound();

            Console.WriteLine("Etat reçu: " + dto.Etat); // debug

            equip.Etat = dto.Etat;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Etat mis à jour" });
        }
    }
}