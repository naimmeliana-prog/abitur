import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("=== SEARCHING ABIBAC LINK IN PROGRAMMSUCHE ===")
try:
    # Fetch program search page
    r = requests.get('https://www.kmk-pad.org/programme/programmsuche', headers=HEADERS, timeout=15)
    soup = BeautifulSoup(r.content, 'html.parser')
    found = False
    for link in soup.find_all('a', href=True):
        href = link['href']
        text = link.text.strip()
        if 'abibac' in href.lower() or 'abibac' in text.lower():
            print(f"Abibac Link Found: {text} -> {href}")
            found = True
            
    if not found:
        print("Abibac link not found on programmsuche main page. Scanning sub-links...")
        # Scan all programme links
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.startswith('/programme/') and len(href) > 11 and 'programmsuche' not in href:
                try:
                    pr = requests.get('https://www.kmk-pad.org' + href, headers=HEADERS, timeout=5)
                    psoup = BeautifulSoup(pr.content, 'html.parser')
                    if 'abibac' in pr.text.lower():
                        print(f"Abibac mention inside program: {href}")
                except:
                    pass
except Exception as e:
    print(f"Error: {e}")
