import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://www.dsmadrid.org/es/colegio/secundaria/asignaturas/matematicas/schulcurriculum-mathematik"
try:
    r = requests.get(url, headers=HEADERS, timeout=10)
    print(f"Subpage Status: {r.status_code}")
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if '.pdf' in href.lower():
            print(f"PDF Found: {text} -> {href}")
except Exception as e:
    print(f"Error: {e}")
