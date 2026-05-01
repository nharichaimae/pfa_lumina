using Vosk;
using NAudio.Wave;
using System;
using System.IO;
using System.Text.Json;

namespace pfa__.net.Services
{
    public class SpeechService : IDisposable
    {
        private readonly Model model;
        private bool disposed = false;

        public SpeechService()
        {
            Vosk.Vosk.SetLogLevel(0);

            // 🔹 Utiliser le chemin absolu pour le modèle
            string modelPath = Path.GetFullPath("vosk-model-small-fr-0.22");

            if (!Directory.Exists(modelPath))
                throw new DirectoryNotFoundException($"Le modèle Vosk n'a pas été trouvé : {modelPath}");

            model = new Model(modelPath);
        }

        public string ConvertSpeechToText(string filePath)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException("Fichier audio introuvable", filePath);

            string tempPath = Path.Combine(Path.GetTempPath(), $"converted_{Guid.NewGuid()}.wav");

            // 🔹 Convertir WAV en mono 16kHz PCM
            using (var reader = new WaveFileReader(filePath))
            using (var resampler = new WaveFormatConversionStream(new WaveFormat(16000, 1), reader))
            using (var writer = new WaveFileWriter(tempPath, resampler.WaveFormat))
            {
                resampler.CopyTo(writer);
            }

            string textResult = string.Empty;

            try
            {
                using var waveReader = new WaveFileReader(tempPath);

                // 🔹 Vérifier que SampleRate est correct
                if (waveReader.WaveFormat.SampleRate != 16000 || waveReader.WaveFormat.Channels != 1)
                    throw new InvalidOperationException("Le fichier audio doit être mono 16 kHz.");

                using var recognizer = new VoskRecognizer(model, waveReader.WaveFormat.SampleRate);

                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = waveReader.Read(buffer, 0, buffer.Length)) > 0)
                {
                    recognizer.AcceptWaveform(buffer, bytesRead);
                }

                var result = recognizer.FinalResult();

                if (!string.IsNullOrWhiteSpace(result))
                {
                    var json = JsonDocument.Parse(result);
                    textResult = json.RootElement.GetProperty("text").GetString();
                }
            }
            finally
            {
                // 🔹 Supprimer le fichier temporaire même en cas d'exception
                if (File.Exists(tempPath))
                    File.Delete(tempPath);
            }

            return textResult ?? string.Empty;
        }

        // 🔹 Implémenter IDisposable pour libérer le modèle
        public void Dispose()
        {
            if (!disposed)
            {
                model?.Dispose();
                disposed = true;
            }
        }
    }
}