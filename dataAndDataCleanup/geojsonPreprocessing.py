import json
from bs4 import BeautifulSoup

# Input and output file paths
input_file = 'SportSGSportFacilitiesGEOJSON.geojson'
output_file = 'SportSGSportFacilitiesGEOJSON.processed.geojson'

# Load the original GeoJSON file
with open(input_file, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)

# Remove the "crs" property if it exists
if 'crs' in geojson_data:
    del geojson_data['crs']

# Process each feature in the GeoJSON
for feature in geojson_data.get('features', []):
    properties = feature.get('properties', {})
    description = properties.get('Description')
    if description:
        # Parse the HTML description using BeautifulSoup
        soup = BeautifulSoup(description, 'html.parser')
        # Find all table rows in the HTML
        for tr in soup.find_all('tr'):
            th = tr.find('th')
            td = tr.find('td')
            if th and td:
                key = th.get_text(strip=True)
                value = td.get_text(strip=True)
                # Add the key-value pair to the feature properties
                properties[key] = value

# Write the processed GeoJSON to a new file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(geojson_data, f, ensure_ascii=False, indent=2)

print(f"Processed GeoJSON written to {output_file}")