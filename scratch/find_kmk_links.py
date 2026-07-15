import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("=== KMK-PAD SEARCH ===")
# Try to search 'abibac' on kmk-pad.org using their internal search or parsing pages
# Let's crawl the home page first
try:
    r = requests.get('https://www.kmk-pad.org/', headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if 'abibac' in href.lower() or 'abibac' in text.lower() or 'programm' in href.lower():
            print(f"KMK Link: {text} -> {href}")
except Exception as e:
    print(f"KMK Error: {e}")

print("\n=== WIKIVERSITY CATEGORIES ===")
# Let's search Wikiversity for Fachbereich categories
try:
    r = requests.get('https://de.wikiversity.org/wiki/Spezial:Kategorien', headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if 'Fachbereich' in text:
            print(f"Wikiversity: {text} -> {href}")
except Exception as e:
    print(f"Wikiversity Error: {e}")
