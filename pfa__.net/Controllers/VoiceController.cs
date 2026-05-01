using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using pfa__.net.Data;
using pfa__.net.Models;
using pfa__.net.Services;
using System.Text.RegularExpressions;

namespace pfa__.net.Controllers
{
    [ApiController]
    [Route("api/voice")]
    public class VoiceController : ControllerBase
    {
        private readonly CommandVocaleService _voiceService;

        public VoiceController(CommandVocaleService voiceService)
        {
            _voiceService = voiceService;
        }

        [HttpPost("control")]
        public async Task<IActionResult> ControlEquipement(IFormFile audio)
        {
            var result = await _voiceService.ProcessVoiceCommand(audio);

            if (!(bool)result.GetType().GetProperty("Success")!.GetValue(result))
                return BadRequest(result);

            return Ok(result);
        }
    }
}