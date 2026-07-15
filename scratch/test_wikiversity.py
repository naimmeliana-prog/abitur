import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = {
    'Wikiversity Mathe': "https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Mathematik",
    'Wikiversity Deutsch': "https://de.wikiversity.org/wiki/Kategorie:Fachbereich_Deutsch",
    'Serlo Mathe': "https://de.serlo.org/mathe",
    'Serlo Deutsch': "https://de.serlo.org/deutsch",
    'Serlo Spanisch': "https://de.serlo.org/spanisch",
    'KMK-PAD Abibac Old': "https://www.kmk-pad.org/programme/abibac.html",
    'KMK-PAD Abibac New': "https://www.kmk-pad.org/programme/abibac-deutsch-franzoesisches-abitur.html"
}

for name, url in urls.items():
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        print(f"{name}: {r.status_code} (Final URL: {r.url})")
    except Exception as e:
        print(f"{name} Error: {e}")
