$envFile = Join-Path -Path (Get-Location) -ChildPath ".env"


if (Test-Path $envFile) {
	Get-Content $envFile | ForEach-Object {
		$line = $_.Trim()
		if ($line -eq "" -or $line.StartsWith("#")) { return }
		$parts = $line -split '=', 2
		if ($parts.Count -ne 2) { return }
		$key = $parts[0].Trim()
		$value = $parts[1].Trim()

		if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
			$value = $value.Substring(1, $value.Length - 2)
		}

		Set-Item -Path Env:$key -Value $value
	}
} else {
	Write-Host '.env not found — using safe defaults for non-sensitive values. Create a .env file (copy .env.example) to provide secrets and overrides.'

	$env:EMAIL_HOST = 'smtp.gmail.com'
	$env:EMAIL_PORT = '587'
	$env:EMAIL_USE_TLS = 'true'
	$env:EMAIL_USE_SSL = 'false'
	$env:DEFAULT_FROM_EMAIL = 'IMG Photos <no-reply@example.com>'
}

python manage.py runserver