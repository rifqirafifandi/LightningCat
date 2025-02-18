import json
import re

# Replace with the path to your GeoJSON file
file_path = 'MasterPlan2019PlanningAreaBoundaryNoSea.geojson'

# Load the GeoJSON file
with open(file_path, 'r') as f:
    data = json.load(f)

# Extract PLN_AREA_N values by parsing the Description field using regex
pln_area_names = set()
for feature in data['features']:
    description = feature['properties'].get('Description', '')
    match = re.search(r'<th>PLN_AREA_N<\/th>\s*<td>(.*?)<\/td>', description)
    if match:
        pln_area_names.add(match.group(1))

# Write the unique PLN_AREA_N values to a file
output_file = 'masterPlanTownNames_output.txt'
with open(output_file, 'w') as f:
    for name in sorted(pln_area_names):
        f.write(name + '\n')

print(f'PLN_AREA_N values have been written to {output_file}')