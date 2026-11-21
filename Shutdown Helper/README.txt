BOOKLY PRO - WINDOWS SHUTDOWN HELPER

Why this extra helper exists
A browser extension is sandboxed and cannot directly run Windows shutdown commands. This optional native helper uses Chrome Native Messaging to pass a user-requested timer to Windows' built-in shutdown.exe. Windows owns the countdown, so closing Bookly does not stop it.

Install once
1. Open chrome://extensions in Chrome.
2. Find Bookly Pro and copy its Extension ID. It is a 32-character value shown on the extension card when Developer mode is enabled.
3. Run Install-BooklyShutdownHost.bat from this folder. If Windows asks for permission, allow the local script you chose to run.
4. Paste the extension ID when asked. The script compiles the small C# native host using the Windows .NET Framework compiler and registers it only for the current Windows user and that extension ID.
5. Restart Chrome, open a new tab, click the clock/timer icon and schedule a test shutdown for at least 5 minutes later. Cancel it from Bookly before the test time.

Important limits
- A shutdown countdown must be at least 1 minute and at most 24 hours.
- The countdown is managed by Windows after it accepts the command; Bookly shows success only when the native helper responds successfully.
- Unsaved files and running applications can still be affected by Windows shutdown. Save work before scheduling.
- If Bookly is reinstalled, its extension ID changes, or you move the extension folder and Chrome generates a different ID, rerun the installer with the current ID.
- Open-Meteo weather and external feeds require an internet connection. Weather forecasts are estimates, not a 100% guarantee.

Uninstall
Run Uninstall-BooklyShutdownHost.bat. Then you may delete this helper folder.
