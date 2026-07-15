import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

url = "https://www.kmk.org/themen/allgemeinbildende-schulen/gegenseitige-anerkennung-von-abiturzeugnissen.html"
try:
    r = requests.get(url, headers=HEADERS, timeout=15)
    print(f"KMK Status: {r.status_code}")
    soup = BeautifulSoup(r.content, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        print(f"KMK Link: {text} -> {href}")
except Exception as e:
    print(f"Error: {e}")
