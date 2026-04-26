import json
from pathlib import Path
import re

# Paths
prediction_file = Path('src/backend/Predictions/prediction.json')
species_file = Path('src/lib/mock-species.ts')

# Read prediction.json
with prediction_file.open('r', encoding='utf-8') as f:
    prediction = json.load(f)

scientific_name = prediction['scientific_name'].strip().lower()

# Read mock-species.ts
with species_file.open('r', encoding='utf-8') as f:
    content = f.read()

# Find the species object with matching scientificName
# Find the line with scientificName
lines = content.split('\n')
found = False
for i, line in enumerate(lines):
    if 'scientificName:' in line and scientific_name in line.lower():
        # Found the species
        found = True
        # Find the end of the object
        end = i + 1
        brace_count = 0
        while end < len(lines):
            brace_count += lines[end].count('{') - lines[end].count('}')
            if brace_count < 0 and lines[end].strip().endswith('},'):
                break
            end += 1
        if end < len(lines):
            # Add collected: true before the closing }
            indent = ' ' * (len(lines[end]) - len(lines[end].lstrip()))
            lines[end] = lines[end].rstrip()[:-2] + ',\n' + indent + '  "collected": true,\n' + indent + '},'
            new_content = '\n'.join(lines)
            with species_file.open('w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {scientific_name} to collected.")
        else:
            print("Could not find end of object")
        break
if not found:
    print(f"Species {scientific_name} not found in mock-species.ts")