using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

internal static class BooklyShutdownHost
{
    private static void Main()
    {
        try
        {
            using (var input = Console.OpenStandardInput())
            using (var output = Console.OpenStandardOutput())
            {
                var lengthBytes = new byte[4];
                int first = input.ReadByte();
                if (first < 0) return;
                lengthBytes[0] = (byte)first;
                ReadExactly(input, lengthBytes, 1, 3);
                int length = BitConverter.ToInt32(lengthBytes, 0);
                if (length < 2 || length > 1024 * 1024) throw new InvalidDataException("Invalid native message length.");
                var payloadBytes = new byte[length];
                ReadExactly(input, payloadBytes, 0, length);
                string payload = Encoding.UTF8.GetString(payloadBytes);
                string action = Match(payload, "\"action\"\\s*:\\s*\"(schedule|cancel)\"");
                bool success = false;
                string message = "Unsupported action.";

                if (action == "schedule")
                {
                    string secondsText = Match(payload, "\"seconds\"\\s*:\\s*(\\d+)");
                    int seconds;
                    if (!Int32.TryParse(secondsText, out seconds) || seconds < 60 || seconds > 86400)
                    {
                        message = "Countdown must be between 60 seconds and 24 hours.";
                    }
                    else
                    {
                        string dummy;
                        RunShutdown("/a", out dummy);
                        success = RunShutdown("/s /t " + seconds, out message);
                        if (success) message = "Windows accepted the shutdown timer.";
                    }
                }
                else if (action == "cancel")
                {
                    string cancelMsg;
                    success = RunShutdown("/a", out cancelMsg);
                    if (success || cancelMsg.IndexOf("1116", StringComparison.OrdinalIgnoreCase) >= 0 || cancelMsg.IndexOf("no shutdown", StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        success = true;
                        message = "Windows accepted the cancellation request.";
                    }
                    else
                    {
                        message = cancelMsg;
                    }
                }

                string json = "{\"success\":" + (success ? "true" : "false") + ",\"action\":\"" + Escape(action) + "\",\"message\":\"" + Escape(message) + "\"}";
                byte[] response = Encoding.UTF8.GetBytes(json);
                output.Write(BitConverter.GetBytes(response.Length), 0, 4);
                output.Write(response, 0, response.Length);
                output.Flush();
            }
        }
        catch (Exception ex)
        {
            // Native host stdout must only contain framed protocol messages. Diagnostics go to stderr.
            Console.Error.WriteLine(ex.Message);
        }
    }

    private static void ReadExactly(Stream stream, byte[] buffer, int offset, int count)
    {
        while (count > 0)
        {
            int read = stream.Read(buffer, offset, count);
            if (read <= 0) throw new EndOfStreamException();
            offset += read;
            count -= read;
        }
    }

    private static string Match(string text, string pattern)
    {
        Match match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : String.Empty;
    }

    private static bool RunShutdown(string arguments, out string message)
    {
        try
        {
            var start = new ProcessStartInfo
            {
                FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "shutdown.exe"),
                Arguments = arguments,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };
            using (Process process = Process.Start(start))
            {
                if (process == null) { message = "Windows shutdown command could not start."; return false; }
                string stdout = process.StandardOutput.ReadToEnd();
                string stderr = process.StandardError.ReadToEnd();
                process.WaitForExit(5000);
                if (process.ExitCode == 0) { message = stdout.Trim(); return true; }
                message = String.IsNullOrWhiteSpace(stderr) ? (stdout.Trim().Length > 0 ? stdout.Trim() : "Windows rejected the request.") : stderr.Trim();
                return false;
            }
        }
        catch (Exception ex) { message = ex.Message; return false; }
    }

    private static string Escape(string value)
    {
        return (value ?? String.Empty).Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", " ").Replace("\n", " ");
    }
}
