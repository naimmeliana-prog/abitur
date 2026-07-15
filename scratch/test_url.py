import requests
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

try:
    r = requests.get('https://www.kmk-pad.org/', headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if 'abibac' in href.lower() or 'abibac' in text.lower():
            print(f"Link: {text} -> {href}")
except Exception as e:
    print(f"Error: {e}")
