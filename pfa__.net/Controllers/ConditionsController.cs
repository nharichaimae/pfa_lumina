using Microsoft.AspNetCore.Mvc;
using pfa__.net.Repositories;
using pfa__.net.Mapper;
using pfa__.net.DTO;
using pfa__.net.Models;

namespace pfa__.net.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConditionsController : ControllerBase
    {
        private readonly IConditionRepository _conditionRepository;
        private readonly IRegleRepository _regleRepository;

        public ConditionsController(
            IConditionRepository conditionRepository,
            IRegleRepository regleRepository)
        {
            _conditionRepository = conditionRepository;
            _regleRepository = regleRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var conditions = await _conditionRepository.GetAllAsync();
            return Ok(ConditionMapper.ToDtoList(conditions));
        }

        [HttpGet("regle/{idRegle}")]
        public async Task<IActionResult> GetByRegle(int idRegle)
        {
            var conditions = await _conditionRepository.GetByRegleIdAsync(idRegle);
            return Ok(ConditionMapper.ToDtoList(conditions));
        }

        [HttpGet("equipement/{idEquipement}")]
        public async Task<IActionResult> GetByEquipement(int idEquipement)
        {
            var conditions = await _conditionRepository.GetByEquipementIdAsync(idEquipement);
            return Ok(ConditionMapper.ToDtoList(conditions));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var condition = await _conditionRepository.GetByIdAsync(id);
            if (condition == null) return NotFound();
            return Ok(ConditionMapper.ToDto(condition));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ConditionCreateDto dto)
        {
            Console.WriteLine($"DTO reçu: IdEquipement={dto.IdEquipement}, Valeur={dto.Valeur}");

            if (!ModelState.IsValid)
            {
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                    Console.WriteLine($"Erreur validation: {error.ErrorMessage}");
                return BadRequest(ModelState);
            }

            // ✅ Prendre la règle la plus récente de l'équipement
            var regles = await _regleRepository.GetByEquipementIdAsync(dto.IdEquipement);
            var regleActive = regles
                .OrderByDescending(r => r.IdRegle)
                .FirstOrDefault();

            if (regleActive == null)
                return BadRequest(new { message = "Aucune règle trouvée pour cet équipement" });

            var model = new ConditionHistorique
            {
                IdRegle   = regleActive.IdRegle,
                Valeur    = dto.Valeur,
                DateHeure = DateTime.Now,
                Source    = "manuel"
            };

            var created = await _conditionRepository.CreateAsync(model);
            var withRegle = await _conditionRepository.GetByIdAsync(created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id },
                ConditionMapper.ToDto(withRegle!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _conditionRepository.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}