import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://www.kmk.org/bildungsministerkonferenz/bildungsthemen/allgemeinbildende-schulen.html"
try:
    r = requests.get(url, headers=HEADERS, timeout=15)
    print(f"KMK Schools Status: {r.status_code}")
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if 'abitur' in href.lower() or 'prüfung' in href.lower() or 'pool' in href.lower():
            print(f"Abitur Link: {text} -> {href}")
except Exception as e:
    print(f"Error: {e}")
