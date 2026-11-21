$ErrorActionPreference = 'Stop'
$hostName = 'com.booklypro.shutdown'
Write-Host ''
Write-Host 'Bookly Pro - Windows Shutdown Helper Setup' -ForegroundColor Cyan
Write-Host '------------------------------------------'

# Auto-detect extension ID from Chrome and Edge
$rawIds = @()
$profileFiles = @(
  (Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data\Default\Secure Preferences'),
  (Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data\Default\Preferences'),
  (Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data\Default\Secure Preferences'),
  (Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data\Default\Preferences')
)

foreach ($f in $profileFiles) {
  if (Test-Path $f) {
    try {
      $json = Get-Content $f -Raw -ErrorAction Stop | ConvertFrom-Json
      $settings = $json.extensions.settings
      if ($settings) {
        foreach ($prop in $settings.PSObject.Properties) {
          $p = $prop.Value.path
          $name = $prop.Value.manifest.name
          if (($p -and $p -like '*Bookly*') -or ($name -and $name -like '*Bookly*')) {
            $rawIds += [string]$prop.Name.ToLowerInvariant()
          }
        }
      }
    } catch {}
  }
}

$detectedIds = @($rawIds | Select-Object -Unique)

$extensionId = ""
if ($detectedIds.Count -gt 0) {
  $firstDetected = $detectedIds | Select-Object -First 1
  Write-Host "Auto-detected Bookly Pro extension ID: $firstDetected" -ForegroundColor Green
  $extensionId = $firstDetected
} else {
  $extensionId = (Read-Host 'Paste the 32-character Bookly Pro extension ID from chrome://extensions').Trim().ToLowerInvariant()
}

if ($extensionId -notmatch '^[a-p]{32}$') {
  Write-Host 'Invalid Chrome extension ID (must be 32 letters from a through p).' -ForegroundColor Red
  Read-Host 'Press Enter to exit'; exit 1
}

$source = Join-Path $PSScriptRoot 'BooklyShutdownHost.cs'
$exe = Join-Path $PSScriptRoot 'BooklyShutdownHost.exe'
$manifestPath = Join-Path $PSScriptRoot 'com.booklypro.shutdown.json'

# Compile if exe doesn't exist or if source is newer
if (-not (Test-Path $exe) -or ((Get-Item $source).LastWriteTime -gt (Get-Item $exe).LastWriteTime)) {
  $candidates = @(
    (Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'),
    (Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe')
  )
  $csc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($csc) {
    Write-Host 'Compiling native helper executable...' -ForegroundColor Yellow
    & $csc /nologo /optimize /target:exe "/out:$exe" $source
  }
}

if (-not (Test-Path $exe)) {
  Write-Host 'Helper executable not found and could not be compiled.' -ForegroundColor Red
  Read-Host 'Press Enter to exit'; exit 1
}

$allowedOrigins = @("chrome-extension://$extensionId/")
foreach ($otherId in $detectedIds) {
  $origin = "chrome-extension://$otherId/"
  if (-not ($allowedOrigins -contains $origin)) {
    $allowedOrigins += $origin
  }
}

$manifest = @{
  name = $hostName
  description = 'Bookly Pro Windows shutdown timer bridge'
  path = $exe
  type = 'stdio'
  allowed_origins = $allowedOrigins
} | ConvertTo-Json -Depth 5

[System.IO.File]::WriteAllText($manifestPath, $manifest, ([System.Text.UTF8Encoding]::new($false)))

$chromeReg = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName"
New-Item -Path $chromeReg -Force | Out-Null
Set-Item -Path $chromeReg -Value $manifestPath

$edgeReg = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$hostName"
New-Item -Path $edgeReg -Force | Out-Null
Set-Item -Path $edgeReg -Value $manifestPath

Write-Host ''
Write-Host 'Setup successfully completed!' -ForegroundColor Green
Write-Host "Host binary: $exe"
Write-Host "Host manifest: $manifestPath"
Write-Host "Registered for Google Chrome & Microsoft Edge."
Write-Host ''
Read-Host 'Press Enter to exit'
