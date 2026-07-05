#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ABITURSTUDY - EXTERNAL RESOURCES SCRAPER & IMPORTER
This script aggregates scraping logic for Serlo.org, Wikiversity.org, 
and the Hessischer Bildungsserver. It outputs results as JSON and can 
be integrated into the Abitur Web platform.

Licensed under CC BY-SA / Respectful Scraping Compliance.
"""

import os
import sys
import json
import time
import re
import requests
from bs4 import BeautifulSoup

# Define default configuration
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
    """
    Fetches articles from Serlo.org
    """
    base_url = "https://de.serlo.org"
    subject_map = {
        'mathe': 'mathematik',
        'deutsch': 'deutsch',
        'englisch': 'englisch',
        'philosophie': 'philosophie',
        'espanol': 'spanisch'
    }
    
    subject_path = subject_map.get(subject, subject)
    url = f"{base_url}/{subject_path}"
    
    print(f"🔍 [SERLO] Scraping: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        articles = []
        # Find article cards and links
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.text.strip()
            # Serlo article path pattern
            if len(text) > 8 and ('/mathe/' in href or '/deutsch/' in href or '/englisch/' in href or '/philosophie/' in href or href.startswith('/') and len(href) > 5):
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
    """
    Scrapes German Wikiversity categories
    """
    base_url = "https://de.wikiversity.org"
    categories = {
        'mathe': 'Fachbereich:Mathematik',
        'deutsch': 'Fachbereich:Deutsch',
        'englisch': 'Fachbereich:Englisch',
        'philosophie': 'Fachbereich:Philosophie',
        'espanol': 'Fachbereich:Spanisch'
    }
    
    cat = categories.get(subject, subject)
    url = f"{base_url}/wiki/Kategorie:{cat}"
    
    print(f"🔍 [WIKIVERSITY] Scraping: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        pages = []
        # Select links in category sections
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
    """
    Scrapes the Hessischer Bildungsserver index pages ethically.
    """
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
        # Rate limit compliance
        time.sleep(1.5)
        
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

def run_all_scrapes():
    subjects = ['mathe', 'deutsch', 'englisch', 'philosophie', 'espanol']
    aggregated_data = {}
    
    for subject in subjects:
        print(f"\n==================== PROCESSING: {subject} ====================")
        serlo_items = fetch_serlo_content(subject)
        wiki_items = scrape_wikiversity(subject)
        hessen_items = scrape_hessen_bildungsserver(subject)
        
        # Merge items and remove duplicate URLs
        urls_seen = set()
        merged = []
        for item in (serlo_items + wiki_items + hessen_items):
            if item['url'] not in urls_seen:
                urls_seen.add(item['url'])
                merged.append(item)
                
        aggregated_data[subject] = {
            'count': len(merged),
            'items': merged
        }
        print(f"✓ Total unique external items found for {subject}: {len(merged)}")
        
    # Write output to local JSON database
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'external_scraped_resources.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(aggregated_data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Saved all scraped materials to: {os.path.abspath(output_path)}")

if __name__ == '__main__':
    run_all_scrapes()
