import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://www.dsmadrid.org/es/secundaria/abitur"
try:
    r = requests.get(url, headers=HEADERS, timeout=10)
    print(f"DSM Status: {r.status_code}")
    soup = BeautifulSoup(r.content, 'html.parser')
    print("=== DSM LINKS ===")
    for link in soup.find_all('a', href=True):
        print(f"Link: {link.text.strip()} -> {link['href']}")
except Exception as e:
    print(f"Error: {e}")
