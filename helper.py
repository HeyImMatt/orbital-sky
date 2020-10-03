"""Makes a call using sat name and returns the wiki page content"""

from flask import Flask
import requests
import os

#n2yo strings
N2YO_BASE_URL= "https://www.n2yo.com/rest/v1/satellite/"
api_key="U9J35D-GT6QWZ-FPTKCN-4KD4"

#api_key = os.getenv("api_key") for after .env set up

#wiki strings
WIKI_BASE_URL = "https://en.wikipedia.org/w/api.php?action=parse&page="
FORMAT_PARAMETERS_HTML = "&format=json&prop=text&formatversion=2"
FORMAT_PARAMETERS_WIKITEXT = "&format=json&prop=wikitext&formatversion=2"

def call_wikitext(search_term):
    """Returns response in WikiText format. If response is error, returns list of USA Satellites"""

    resp = requests.get(f"{WIKI_BASE_URL}{search_term}{FORMAT_PARAMETERS_WIKITEXT}").json()
    if "error" in resp:
        return requests.get(f"{WIKI_BASE_URL}List_of_USA_satellites{FORMAT_PARAMETERS_WIKITEXT}").json()["parse"]["wikitext"]
    else:
        return parse_for_sat(resp['parse']['wikitext'], search_term)

def parse_for_sat(response, search_term):
    sat_count = response.count('atellite')
    if sat_count >= 3:
        return response
    else:
        return call_html(f"{search_term}_(satellite)")

#In case we wanna use the html response. Both look a lil hairy.

def call_html(search_term):
    """Returns response in HTML format"""

    resp = requests.get(f"{BASE_URL}{search_term}{FORMAT_PARAMETERS_HTML}").json()["parse"]["text"]


def vis_sat_ids(lat, lng, alt=0, rad=70):
    """Returns List of Sattelite Norad IDs if Visible from specified location"""
    sats = requests.get(f"{N2YO_BASE_URL}/above/{str(lat)}/{str(lng)}/{str(alt)}/{str(rad)}/0/&apiKey={api_key}").json()["above"]
    sat_ids = [sat["satid"] for sat in sats]
    return sat_ids