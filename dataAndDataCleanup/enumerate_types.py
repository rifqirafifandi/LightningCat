import json

unique_activities = set()
unique_facilities = set()
with open('dataAndDataCleanup/facility_data.json', 'r') as f:
  data = json.load(f)

for facility in data:
  unique_facilities.add(facility['name'])
  for activity in facility['activities']:
    unique_activities.add(activity)

with open('frontend/src/types/activityTypes.json', 'w+') as f:
  json.dump(sorted(list(unique_activities)), f, indent=2)
with open('frontend/src/types/facilityNames.json', 'w+') as f:
  json.dump(sorted(list(unique_facilities)), f, indent=2)
