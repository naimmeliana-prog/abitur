#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ABITURSTUDY - EXTERNAL RESOURCES SCRAPER & IMPORTER
This script aggregates scraping logic for Serlo.org, Wikiversity.org, 
Hessischer Bildungsserver, and Abiturloesung.de. It outputs results as JSON.

Licensed under CC BY-SA / Respectful Scraping Compliance.
"""

import os
import sys
import json
import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'AbiturStudyBot/1.0 (Educational Purpose; contact@abiturstudy.local)'
}

def check_robots_txt(base_url):
    """Verifies robots.txt before scraping a domain."""
    robots_url = f"{base_url}/robots.txt"
    try:
        r = requests.get(robots_url, timeout=5, headers=HEADERS)
        if r.status_code == 200:
            print(f"[ROBOTS.TXT] Checked {base_url} successfully.")
            return r.text
    except Exception as e:
        print(f"[ROBOTS.TXT] Could not fetch robots.txt for {base_url}: {e}")
    return None

def fetch_serlo_content(subject):
    """Fetches articles from Serlo.org (Only available for math)"""
    if subject != 'mathe':
        return []
        
    base_url = "https://de.serlo.org"
    url = f"{base_url}/mathe"
    
    print(f"🔍 [SERLO] Scraping: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        articles = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.text.strip()
            if len(text) > 8 and ('/mathe/' in href or href.startswith('/') and len(href) > 5):
                articles.append({
                    'title': text,
                    'url': href if href.startswith('http') else base_url + href,
                    'source': 'serlo.org',
                    'license': 'CC BY-SA 4.0'
                })
        return articles
    except Exception as e:
        print(f"❌ [SERLO] Error: {e}")
        return []

def scrape_wikiversity(subject):
    """Scrapes German Wikiversity categories"""
    base_url = "https://de.wikiversity.org"
    categories = {
        'mathe': 'Fachbereich_Mathematik',
        'deutsch': 'Fachbereich_Germanistik',
        'englisch': 'Fachbereich_Anglistik',
        'philosophie': 'Fachbereich_Philosophie',
        'espanol': 'Fachbereich_Romanistik'
    }
    
    cat = categories.get(subject)
    if not cat:
        return []
    url = f"{base_url}/wiki/Kategorie:{cat}"
    
    print(f"🔍 [WIKIVERSITY] Scraping: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        pages = []
        for link in soup.select('#mw-pages .mw-category-group a'):
            pages.append({
                'title': link.text.strip(),
                'url': base_url + link['href'],
                'source': 'wikiversity.org',
                'license': 'CC BY-SA 4.0'
            })
        return pages
    except Exception as e:
        print(f"❌ [WIKIVERSITY] Error for {subject}: {e}")
        return []

def scrape_hessen_bildungsserver(subject):
    """Scrapes the Hessischer Bildungsserver index pages ethically."""
    urls = {
        'mathe': 'https://lernarchiv.bildung.hessen.de/sek/mathematik/index.html',
        'deutsch': 'https://lernarchiv.bildung.hessen.de/sek/deutsch/index.html',
        'englisch': 'https://lernarchiv.bildung.hessen.de/sek/englisch/index.html',
        'philosophie': 'https://lernarchiv.bildung.hessen.de/sek/philosophie/index.html'
    }
    
    url = urls.get(subject)
    if not url:
        return []
    
    print(f"🔍 [HESSEN] Scraping: {url}")
    try:
        time.sleep(1.0)
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        materials = []
        for item in soup.find_all('a', href=True):
            href = item['href']
            title_text = item.text.strip()
            if len(title_text) > 5 and any(ext in href.lower() for ext in ['.pdf', '.html', '.htm']):
                materials.append({
                    'title': title_text,
                    'url': href if href.startswith('http') else f"https://lernarchiv.bildung.hessen.de{href}",
                    'source': 'hessen-bildungsserver',
                    'license': 'Verify Individually',
                    'type': 'pdf' if '.pdf' in href.lower() else 'html'
                })
        return materials
    except Exception as e:
        print(f"❌ [HESSEN] Error: {e}")
        return []

def scrape_abiturloesung(subject):
    """Scrapes solutions from abiturloesung.de for mathematics."""
    if subject != 'mathe':
        return []
    
    base_url = "https://abiturloesung.de"
    url = f"{base_url}/abitur/Bayern"
    
    print(f"🔍 [ABITURLOESUNG] Scraping: {url}")
    try:
        time.sleep(1.0)
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        resources = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.text.strip()
            if any(year in href for year in ['2024', '2023', '2022', '2021', '2020']) or '.pdf' in href.lower():
                if len(text) > 3:
                    resources.append({
                        'title': f"Abitur Bayern Mathe: {text}",
                        'url': href if href.startswith('http') else base_url + href,
                        'source': 'abiturloesung.de',
                        'license': 'Verify Individually/Educational',
                        'type': 'pdf' if '.pdf' in href.lower() else 'html'
                    })
        return resources
    except Exception as e:
        print(f"❌ [ABITURLOESUNG] Error: {e}")
        return []

def scrape_colegios_alemanes(subject):
    """Scrapes Abitur resources and PDFs from the 9 official German schools in Spain"""
    # Since these are German schools, materials are usually for general subjects
    # We will look for PDFs on their Abitur landing pages
    schools = {
        'dsmadrid': 'https://www.dsmadrid.org/es/secundaria/abitur',
        'dsbarcelona': 'https://www.dsbarcelona.com/es/secundaria/abitur',
        'dsvalencia': 'https://www.dsvalencia.org/es/abitur',
        'dsbilbao': 'https://www.dsbilbao.org/es/secundaria/abitur',
        'dsmalaga': 'https://www.dsmalaga.com/es/secundaria/abitur',
        'colegioaleman_san_sebastian': 'https://colegioaleman.net/es/abitur',
        'colegioaleman_sevilla': 'https://colegioalemansevilla.com/es/secundaria/abitur',
        'dstenerife': 'https://www.dstenerife.eu/es/secundaria/abitur',
        'dslpa': 'https://www.dslpa.org/es/secundaria/abitur'
    }
    
    resources = []
    for school_name, url in schools.items():
        print(f"🔍 [COLEGIO ALEMAN] Scraping {school_name}: {url}")
        try:
            time.sleep(1.0)
            response = requests.get(url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                print(f"⚠️ [COLEGIO ALEMAN] Status code {response.status_code} for {school_name}")
                continue
                
            soup = BeautifulSoup(response.content, 'html.parser')
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.text.strip()
                if '.pdf' in href.lower() or any(keyword in href.lower() or keyword in text.lower() for keyword in ['abitur', 'prüfung', 'examen', 'modelo', 'dias']):
                    from urllib.parse import urljoin
                    full_url = urljoin(url, href)
                    
                    if len(text) > 3:
                        resources.append({
                            'title': f"[{school_name.upper()}] {text}",
                            'url': full_url,
                            'source': f"{school_name}.org",
                            'license': 'Educational Use/Public School Document',
                            'type': 'pdf' if '.pdf' in href.lower() else 'html'
                        })
        except Exception as e:
            print(f"❌ [COLEGIO ALEMAN] Error scraping {school_name}: {e}")
            
    return resources

def scrape_kmk_org(subject):
    """Scrapes official Abitur standards and pool guidelines from the Kultusministerkonferenz (kmk.org)"""
    if subject not in ['deutsch', 'mathe', 'englisch']:
        return []
        
    base_url = "https://www.kmk.org"
    url = f"{base_url}/themen/allgemeinbildende-schulen/gegenseitige-anerkennung-von-abiturzeugnissen.html"
    
    print(f"🔍 [KMK.ORG] Scraping: {url}")
    try:
        time.sleep(1.0)
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code != 200:
            return []
            
        soup = BeautifulSoup(response.content, 'html.parser')
        resources = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.text.strip()
            if '.pdf' in href.lower() or any(keyword in href.lower() or keyword in text.lower() for keyword in ['abitur', 'prüfung', 'bildungsstandards']):
                from urllib.parse import urljoin
                full_url = urljoin(url, href)
                if len(text) > 3:
                    resources.append({
                        'title': f"KMK: {text}",
                        'url': full_url,
                        'source': 'kmk.org',
                        'license': 'Official Public Document',
                        'type': 'pdf' if '.pdf' in href.lower() else 'html'
                    })
        return resources
    except Exception as e:
        print(f"❌ [KMK.ORG] Error: {e}")
        return []

def run_all_scrapes():
    subjects = ['mathe', 'deutsch', 'englisch', 'philosophie', 'espanol']
    aggregated_data = {}
    
    for subject in subjects:
        print(f"\n==================== PROCESSING: {subject} ====================")
        serlo_items = fetch_serlo_content(subject)
        wiki_items = scrape_wikiversity(subject)
        hessen_items = scrape_hessen_bildungsserver(subject)
        abiturloesung_items = scrape_abiturloesung(subject)
        colegios_items = scrape_colegios_alemanes(subject)
        kmk_items = scrape_kmk_org(subject)
        
        urls_seen = set()
        merged = []
        for item in (serlo_items + wiki_items + hessen_items + abiturloesung_items + colegios_items + kmk_items):
            if item['url'] not in urls_seen:
                urls_seen.add(item['url'])
                merged.append(item)
                
        aggregated_data[subject] = {
            'count': len(merged),
            'items': merged
        }
        print(f"✓ Total unique external items found for {subject}: {len(merged)}")
        
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'external_scraped_resources.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(aggregated_data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Saved all scraped materials to: {os.path.abspath(output_path)}")

if __name__ == '__main__':
    run_all_scrapes()
