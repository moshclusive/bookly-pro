$hostName = 'com.booklypro.shutdown'
$chromeReg = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName"
$edgeReg = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$hostName"
if (Test-Path $chromeReg) { Remove-Item -Path $chromeReg -Recurse -Force }
if (Test-Path $edgeReg) { Remove-Item -Path $edgeReg -Recurse -Force }
Write-Host 'Bookly Pro native messaging registration removed.' -ForegroundColor Green
Read-Host 'Press Enter to exit'
