# ==========================================================
# Windows Media / Spotify Background Watcher
# Transmits currently playing track in real time to local VRChat OSC Hub
# ==========================================================

$apiUrl = "http://localhost:3000/api/media/now-playing"
$lastSong = ""

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VRChat OSC Hub - Windows Spotify Media Watcher          " -ForegroundColor Cyan
Write-Host "  Target API: $apiUrl                                     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

while ($true) {
    try {
        # 1. Query Spotify Desktop main window title
        $spotify = Get-Process -Name "spotify" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object -First 1
        if ($spotify) {
            $titleText = $spotify.MainWindowTitle
            if ($titleText -and $titleText -notmatch "^(Spotify.*|Giga.*)$") {
                if ($titleText -ne $lastSong) {
                    $lastSong = $titleText
                    $parts = $titleText -split " - ", 2
                    $artist = if ($parts.Length -gt 1) { $parts[0] } else { "" }
                    $songTitle = if ($parts.Length -gt 1) { $parts[1] } else { $parts[0] }

                    $body = @{
                        title = $songTitle
                        artist = $artist
                        isPlaying = $true
                        source = "Spotify Windows Desktop"
                    } | ConvertTo-Json

                    Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
                    Write-Host "♪ $artist - $songTitle" -ForegroundColor Green
                }
            } else {
                if ($lastSong -ne "") {
                    $lastSong = ""
                    $body = @{
                        title = ""
                        artist = ""
                        isPlaying = $false
                        source = "Spotify (Paused)"
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
                    Write-Host "⏸ Playback paused or stopped" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        # Suppress network errors (e.g. if local hub is restarting)
    }
    Start-Sleep -Milliseconds 1500
}
