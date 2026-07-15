import requests

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = {
    'KMK Abibac Clean': 'https://www.kmk-pad.org/programme/abibac',
    'Wikiversity Germanistik': 'https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Germanistik',
    'Wikiversity Anglistik': 'https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Anglistik',
    'Wikiversity Philosophie': 'https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Philosophie',
    'Wikiversity Spanisch': 'https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Spanisch_/_Romanistik'
}

for name, url in urls.items():
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        print(f"{name}: {r.status_code} (Final URL: {r.url})")
    except Exception as e:
        print(f"{name} Error: {e}")
