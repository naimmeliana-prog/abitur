import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

try:
    r = requests.get('https://de.serlo.org/', headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.content, 'html.parser')
    print("=== SERLO HOMEPAGE LINKS ===")
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if len(text) > 2 and ('de.serlo.org/' in href or href.startswith('/')):
            print(f"{text} -> {href}")
except Exception as e:
    print(f"Error: {e}")
