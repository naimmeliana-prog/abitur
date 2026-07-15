import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://www.iqb.hu-berlin.de/abitur/pool_laender/"
try:
    r = requests.get(url, headers=HEADERS, timeout=10)
    print(f"Status: {r.status_code}")
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if 'abitur' in href.lower() or 'pool' in href.lower() or '.pdf' in href.lower():
            print(f"{text} -> {href}")
except Exception as e:
    print(f"Error: {e}")
