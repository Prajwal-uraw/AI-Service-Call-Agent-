"""
Job Board Scrapers Package
"""

from .indeed_scraper import IndeedScraper
from .ziprecruiter_scraper import ZipRecruiterScraper

__all__ = ['IndeedScraper', 'ZipRecruiterScraper']
