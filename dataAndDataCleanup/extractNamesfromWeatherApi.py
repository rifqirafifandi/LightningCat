import json

# Read API response from file
with open('twoHourWeatherData_sample.json', 'r') as file:
    data = json.load(file)

# Extract names and convert to uppercase
names = [area['name'].upper() for area in data['data']['area_metadata']]

# Write names to a file
with open('weatherApiTownNames_output.txt', 'w') as file:
    for name in names:
        file.write(name + '\n')

print("Names extracted and written to weatherApiTownNames_output.txt")