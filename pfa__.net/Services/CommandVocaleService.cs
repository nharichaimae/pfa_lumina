namespace pfa__.net.Services
{
    public class CommandVocaleService
    {
        private readonly SpeechService _speechService;
        private readonly TextService _textService;
        private readonly EquipementService _equipementService;

        public CommandVocaleService(
            SpeechService speechService,
            TextService textService,
            EquipementService equipementService)
        {
            _speechService = speechService;
            _textService = textService;
            _equipementService = equipementService;
        }

        public async Task<object> ProcessVoiceCommand(IFormFile audio)
        {
            if (audio == null || audio.Length == 0)
                return new { Success = false, Error = "❌ Aucun fichier audio" };

            string tempFile = Path.Combine(Path.GetTempPath(), $"voice_{Guid.NewGuid()}.wav");

            using (var stream = new FileStream(tempFile, FileMode.Create))
                await audio.CopyToAsync(stream);

            string text = _speechService.ConvertSpeechToText(tempFile);
            text = _textService.NormalizeText(text);

            if (File.Exists(tempFile))
                File.Delete(tempFile);

            if (string.IsNullOrEmpty(text))
                return new { Success = false, Error = "❌ Aucun texte détecté", text };

            string command = _textService.DetectCommand(text);
            if (command == "UNKNOWN")
                return new { Success = false, Error = "❌ Commande inconnue", text };

            int? numero = _textService.ExtractNumber(text)
                          ?? _textService.ExtractNumberFromWords(text);

            var equipement = await _equipementService.FindEquipement(text, numero);

            if (equipement == null)
                return new
                {
                    Success = false,
                    Error = "❌ Aucun équipement trouvé",
                    text
                };

            string etatAvant = equipement.Etat;

            await _equipementService.UpdateEtat(equipement, command);

            return new
            {
                Success = true,
                Message = command == "ON"
                    ? $"{equipement.Nom} allumé dans {equipement.Piece.Nom} "
                    : $"{equipement.Nom} éteint dans {equipement.Piece.Nom}",
                Equipement = new
                {
                    equipement.Id_Equipement,
                    equipement.Nom,
                    Piece = equipement.Piece.Nom,
                    etatAvant,
                    etatActuel = command
                },
                textDetecte = text
            };
        }
    }
}
