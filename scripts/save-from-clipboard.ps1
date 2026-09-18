$c = (Get-Clipboard -Raw).Trim()
if ($c -match '^(AIza|AQ\.)[\w.\-]{20,}$') {
  Set-Content -Path ".env.local" -Value "GOOGLE_GENERATIVE_AI_API_KEY=$c" -Encoding ASCII
  $fmt = if ($c.StartsWith("AQ.")) { "new-format (AQ.)" } else { "classic (AIza)" }
  Write-Output "SUCCESS: Gemini key saved to .env.local ($fmt, length $($c.Length))"
} elseif ($c -match '^sk-ant') {
  Write-Output "FOUND: an Anthropic key on the clipboard - SortCall needs the GOOGLE Gemini key"
} elseif ($c.Length -eq 0) {
  Write-Output "CLIPBOARD EMPTY - copy the key first"
} else {
  $head = if ($c.Length -gt 8) { $c.Substring(0, 8) } else { $c }
  Write-Output "NOT RECOGNIZED (starts '$head', length $($c.Length))"
}
