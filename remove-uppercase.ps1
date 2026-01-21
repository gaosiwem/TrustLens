#!/usr/bin/env pwsh

# Script to remove all 'uppercase' classes from TypeScript/TSX files
$srcPath = "c:\Users\5907\Documents\Projects\Tsediyalo\TrustLens\frontend\src"

Get-ChildItem -Path $srcPath -Recurse -Include *.tsx,*.ts,*.jsx,*.js | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match '\buppercase\b') {
        Write-Host "Processing: $($file.FullName)"
        $newContent = $content -replace '\s*uppercase\s*', ' '
        $newContent = $newContent -replace '\s+', ' '
        $newContent = $newContent -replace '\s+className=', ' className='
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
    }
}

Write-Host "Done!"
