# Replace YOUR_API_KEY with your actual key
$apiKey = "YOUR_API_KEY"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey"

$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Hello"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Testing Gemini API..."
Write-Host "URL: $($url.Replace($apiKey, 'API_KEY_HIDDEN'))"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response.candidates[0].content.parts[0].text)"
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody"
    }
}