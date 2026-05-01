using Microsoft.AspNetCore.Mvc;
using pfa__.net.DTO;
using pfa__.net.Mapper;
using pfa__.net.Repositories;

namespace pfa__.net.Controllers
{
    [ApiController]
    [Route("api")]
    public class PieceController : ControllerBase
    {
        private readonly IPieceRepository _pieceRepository;

        public PieceController(IPieceRepository pieceRepository)
        {
            _pieceRepository = pieceRepository;
        }

        [HttpPost("piece")]
        public async Task<IActionResult> AddPiece([FromBody] AddPieceDto dto)
        {
            var userId = (int?)HttpContext.Items["UserId"];
            if (userId == null)
                return Unauthorized(new { message = "JWT invalide ou manquant" });

            var piece = PieceMapper.ToPiece(dto, userId.Value);
            int newPieceId = await _pieceRepository.AddPieceAsync(piece);

            return CreatedAtAction(
    nameof(GetPiecesByUser),
    new { id = newPieceId },
    new { message = "Pièce ajoutée", pieceId = newPieceId }
);
        }

        [HttpGet("pieces")]
        public async Task<IActionResult> GetPiecesByUser()
        {
            var userId = (int?)HttpContext.Items["UserId"];
            if (userId == null)
                return Unauthorized(new { message = "JWT invalide ou manquant" });

            var pieces = await _pieceRepository.ListerPiece(userId.Value);

            var piecesDto = pieces
                .Select(p => PieceMapper.ToDto(p))
                .ToList();

            return Ok(piecesDto);
        }

        [HttpDelete("piece/{id}")]
        public async Task<IActionResult> SupprimerPiece(int id)
        {
            var userId = (int?)HttpContext.Items["UserId"];
            if (userId == null)
                return Unauthorized(new { message = "JWT invalide ou manquant" });

            var result = await _pieceRepository.SupprimerPieceAsync(id);

            if (!result)
                return NotFound(new { message = "Pièce non trouvée" });

            return NoContent();
        }


        [HttpGet("piecetypes")]
        public async Task<IActionResult> GetPieceTypes()
        {
            var types = await _pieceRepository.GetPieceTypesAsync();

            var result = types.Select(t => new
            {
                id_type = t.id_type,
                nom = t.Nom,
                icon = t.Icon
            });

            return Ok(result);
        }
        //duplicate 

        [HttpPost("piece/{id}/duplicate")]
        public async Task<IActionResult> DuplicatePiece(int id)
        {
            var userId = (int?)HttpContext.Items["UserId"];
            if (userId == null)
                return Unauthorized(new { message = "JWT invalide ou manquant" });


            int newPieceId = await _pieceRepository.DuplicatePieceAsync(id, userId.Value);
            return CreatedAtAction(
                nameof(GetPiecesByUser),
                new { id = newPieceId },
                new { message = "Pièce dupliquée", pieceId = newPieceId }
            );


        }
    }
}