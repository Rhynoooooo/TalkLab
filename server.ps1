param (
    [int]$Port = 8080
)

$baseDir = $PSScriptRoot

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json; charset=utf-8"
    ".ico"  = "image/x-icon"
    ".mp3"  = "audio/mpeg"
    ".m4a"  = "audio/mp4"
    ".wav"  = "audio/wav"
    ".ogg"  = "audio/ogg"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)

try {
    $listener.Start()
    Write-Host "================================================="
    Write-Host "TalkLab Web Server running on ALL network interfaces!"
    Write-Host "  Local PC:   http://localhost:$Port/"
    Write-Host "  Phone/Wi-Fi: http://192.168.1.2:$Port/"
    Write-Host "================================================="
} catch {
    Write-Error ("Failed to start TCP listener on port {0}: {1}" -f $Port, $_)
    exit 1
}

$buf = New-Object byte[] 8192

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $bytesRead = $stream.Read($buf, 0, $buf.Length)
        if ($bytesRead -le 0) {
            $client.Close()
            continue
        }

        $requestText = [System.Text.Encoding]::ASCII.GetString($buf, 0, $bytesRead)
        $firstLine = ($requestText -split "`r`n")[0]
        $parts = $firstLine -split " "

        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $urlPath = $parts[1]
        if ($urlPath.Contains("?")) {
            $urlPath = $urlPath.Substring(0, $urlPath.IndexOf("?"))
        }

        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        $filePath = Join-Path $baseDir $urlPath.TrimStart('/').Replace('/', '\')

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $contentBytes = [System.IO.File]::ReadAllBytes($filePath)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($contentBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($contentBytes, 0, $contentBytes.Length)
        } else {
            $notFound = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
            $notFoundBytes = [System.Text.Encoding]::ASCII.GetBytes($notFound)
            $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }

        $stream.Flush()
        $client.Close()
    } catch {
        # Continue loop on connection error
    }
}
