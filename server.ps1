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
    Write-Host "  Local PC:    http://localhost:$Port/"
    Write-Host "  OpenWA API:  http://localhost:2785/"
    Write-Host "================================================="
} catch {
    Write-Error ("Failed to start TCP listener on port {0}: {1}" -f $Port, $_)
    exit 1
}

$buf = New-Object byte[] 65536

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $bytesRead = $stream.Read($buf, 0, $buf.Length)
        if ($bytesRead -le 0) {
            $client.Close()
            continue
        }

        $requestText = [System.Text.Encoding]::UTF8.GetString($buf, 0, $bytesRead)
        $firstLine = ($requestText -split "`r`n")[0]
        $parts = $firstLine -split " "

        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $method = $parts[0].ToUpper()
        $rawUrl = $parts[1]
        $urlPath = $rawUrl
        if ($urlPath.Contains("?")) {
            $urlPath = $urlPath.Substring(0, $urlPath.IndexOf("?"))
        }

        # Handle CORS preflight
        if ($method -eq "OPTIONS") {
            $corsHeader = "HTTP/1.1 200 OK`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, Authorization, X-API-Key`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
            $corsBytes = [System.Text.Encoding]::ASCII.GetBytes($corsHeader)
            $stream.Write($corsBytes, 0, $corsBytes.Length)
            $stream.Flush()
            $client.Close()
            continue
        }

        # Proxy /api/* to OpenWA on port 2785
        if ($urlPath.StartsWith("/api/") -or $urlPath -eq "/api") {
            try {
                $targetUri = "http://127.0.0.1:2785" + $rawUrl
                $req = [System.Net.HttpWebRequest]::Create($targetUri)
                $req.Method = $method
                $req.Timeout = 10000

                # Forward X-API-Key or headers if present
                if ($requestText -match "X-API-Key:\s*([^\r\n]+)") {
                    $req.Headers["X-API-Key"] = $matches[1].Trim()
                } else {
                    $req.Headers["X-API-Key"] = "owa_k1_78563b70da24d3e87a9bb12696ef65a06cbab25520e6583ea6dd2ca7b396bc8e"
                }

                if ($method -eq "POST" -or $method -eq "PUT") {
                    $req.ContentType = "application/json"
                    $bodyIndex = $requestText.IndexOf("`r`n`r`n")
                    if ($bodyIndex -ge 0) {
                        $reqBody = $requestText.Substring($bodyIndex + 4)
                        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($reqBody)
                        $req.ContentLength = $bodyBytes.Length
                        $reqStream = $req.GetRequestStream()
                        $reqStream.Write($bodyBytes, 0, $bodyBytes.Length)
                        $reqStream.Close()
                    }
                }

                $resp = $null
                try {
                    $resp = $req.GetResponse()
                } catch [System.Net.WebException] {
                    $resp = $_.Exception.Response
                }

                if ($resp -ne $null) {
                    $statusCode = [int]$resp.StatusCode
                    $statusDesc = $resp.StatusDescription
                    $respStream = $resp.GetResponseStream()
                    $respMem = New-Object System.IO.MemoryStream
                    $respStream.CopyTo($respMem)
                    $respBytes = $respMem.ToArray()
                    $respStream.Close()
                    $resp.Close()

                    $header = "HTTP/1.1 $statusCode $statusDesc`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($respBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Headers: Content-Type, Authorization, X-API-Key`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($respBytes, 0, $respBytes.Length)
                    $stream.Flush()
                    $client.Close()
                    continue
                }
            } catch {
                # Fallback to local 502
                $errJson = '{"error":"OpenWA Proxy Error","message":"' + $_.Exception.Message + '"}'
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $header = "HTTP/1.1 502 Bad Gateway`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($errBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($errBytes, 0, $errBytes.Length)
                $stream.Flush()
                $client.Close()
                continue
            }
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
