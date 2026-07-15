import requests
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

schools = {
    'dsmadrid': 'https://www.dsmadrid.org/es/secundaria/abitur'
}

all_resources = []

for school_name, url in schools.items():
    print(f"Scraping {school_name}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        visited_subpages = set()
        
        def find_pdfs(page_soup, page_url):
            page_resources = []
            for link in page_soup.find_all('a', href=True):
                href = link['href']
                text = link.text.strip()
                if '.pdf' in href.lower():
                    full_url = urljoin(page_url, href)
                    page_resources.append((text, full_url))
            return page_resources

        print("Direct PDFs:")
        for t, u in find_pdfs(soup, url):
            print(f"- {t}: {u}")
            
        print("\nScanning subpages...")
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_sub_url = urljoin(url, href)
            if school_name in full_sub_url and any(k in href.lower() for k in ['abitur', 'lehrplan', 'curriculum', 'curriculo', 'prüfung', 'examen']):
                if full_sub_url not in visited_subpages:
                    visited_subpages.add(full_sub_url)
                    print(f"Visiting subpage: {full_sub_url}")
                    try:
                        time.sleep(0.5)
                        sub_res = requests.get(full_sub_url, headers=HEADERS, timeout=10)
                        sub_soup = BeautifulSoup(sub_res.content, 'html.parser')
                        for t, u in find_pdfs(sub_soup, full_sub_url):
                            print(f"  PDF Found: {t} -> {u}")
                    except Exception as err:
                        print(f"  Error: {err}")
    except Exception as e:
        print(f"Error: {e}")
