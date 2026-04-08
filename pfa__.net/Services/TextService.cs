using System.Text.RegularExpressions;

namespace pfa__.net.Services
{
    public class TextService
    {
        public string NormalizeText(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";

            return text.ToUpper()
                .Replace("TÉLÉVISION", "TV")
                .Replace("AIMER", "ALLUMER")
                .Replace("ALLEZ", "ALLUME")
                .Replace("ALUME", "ALLUME")
                .Replace("ALUMER", "ALLUMER")
                .Replace("ETEIN", "ETEINDRE")
                .Replace("ETEINT", "ETEINDRE")
                .Replace(".", "")
                .Replace(",", "")
                .Trim();
        }

        public string DetectCommand(string text)
        {
            if (Regex.IsMatch(text, @"\b(ALLUME|ALLUMER|ON|OUVRE|ALLUMEZ )\b")) return "ON";
            if (Regex.IsMatch(text, @"\b(ETEINDRE|ETEINS|OFF|FERME|ARRÊTEZ)\b")) return "OFF";
            return "UNKNOWN";
        }

        public int? ExtractNumber(string text)
        {
            var match = Regex.Match(text, @"\d+");
            return match.Success ? int.Parse(match.Value) : null;
        }

        public int? ExtractNumberFromWords(string text)
        {
            text = text.ToUpper();

            if (text.Contains("UN") || text.Contains("PREMIERE")) return 1;
            if (text.Contains("DEUX") || text.Contains("DEUXIEME")) return 2;
            if (text.Contains("TROIS") || text.Contains("TROISIEME")) return 3;

            return null;
        }
    }
}
