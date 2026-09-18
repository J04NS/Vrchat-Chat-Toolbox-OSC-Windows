# ==========================================================
# Windows Spotify & Media Sync for VRChat Chatbox Hub
# Transmits playing music in real-time to http://localhost:3000
# ==========================================================
$ServerUrl = "http://localhost:3000/api/media/now-playing"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Windows Media Watcher for VRChat OSC Hub" -ForegroundColor Green
Write-Host "  Syncing Spotify & Windows Media to $ServerUrl" -ForegroundColor Gray
Write-Host "======================================================" -ForegroundColor Cyan

$lastTitle = ""
$lastArtist = ""
$lastPlaying = $false

while ($true) {
    try {
        $spotifyProcess = Get-Process -Name Spotify -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object -ExpandProperty MainWindowTitle -First 1

        if ($spotifyProcess) {
            $windowTitle = $spotifyProcess.Trim()

            if ($windowTitle -eq "Spotify" -or $windowTitle.StartsWith("Spotify Free") -or $windowTitle.StartsWith("Spotify Premium")) {
                if ($lastPlaying) {
                    $body = @{
                        isPlaying = $false
                        source = "Spotify (Paused)"
                    } | ConvertTo-Json

                    Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
                    $lastPlaying = $false
                    Write-Host "[Media] Playback paused" -ForegroundColor Yellow
                }
            }
            elseif ($windowTitle.Contains(" - ")) {
                $split = $windowTitle.IndexOf(" - ")
                $artist = $windowTitle.Substring(0, $split).Trim()
                $title = $windowTitle.Substring($split + 3).Trim()

                if ($title -ne $lastTitle -or $artist -ne $lastArtist -or -not $lastPlaying) {
                    $body = @{
                        title = $title
                        artist = $artist
                        isPlaying = $true
                        source = "Spotify Windows"
                    } | ConvertTo-Json

                    Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
                    $lastTitle = $title
                    $lastArtist = $artist
                    $lastPlaying = $true
                    Write-Host "[Media] Playing: $artist - $title" -ForegroundColor Green
                }
            }
        }
    }
    catch {
        # Ignore intermittent network errors if server is restarting
    }

    Start-Sleep -Milliseconds 1000
}
