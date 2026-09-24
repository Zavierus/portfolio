$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$url = 'http://127.0.0.1:4266/'
$port = 4266

$ready = $false
try {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
  $ready = $response.StatusCode -eq 200
} catch {
  $ready = $false
}

if (-not $ready) {
  $python = Get-Command python.exe -ErrorAction SilentlyContinue
  if (-not $python) {
    $python = Get-Command py.exe -ErrorAction SilentlyContinue
  }

  if (-not $python) {
    throw 'Python is required to start the local preview server.'
  }

  $arguments = if ($python.Name -eq 'py.exe') {
    @('-3', '-m', 'http.server', "$port")
  } else {
    @('-m', 'http.server', "$port")
  }

  Start-Process -FilePath $python.Source -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden

  for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
    Start-Sleep -Milliseconds 250
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {
      $ready = $false
    }
  }
}

if (-not $ready) {
  throw "Preview server did not become ready at $url"
}

Start-Process $url
