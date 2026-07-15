import requests

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = {
    'Wikiversity Romanistik': 'https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Romanistik',
    'KMK Voltaire': 'https://www.kmk-pad.org/programme/voltaire',
    'KMK Abibac Direct': 'https://www.kmk-pad.org/programme/abibac-deutsch-franzoesisches-abitur',
    'KMK Abibac Slash': 'https://www.kmk-pad.org/programme/abibac-deutsch-franzoesisches-abitur/'
}

for name, url in urls.items():
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        print(f"{name}: {r.status_code} (Final URL: {r.url})")
    except Exception as e:
        print(f"{name} Error: {e}")
