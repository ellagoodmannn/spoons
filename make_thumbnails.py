import os
import json
import base64
from PIL import Image
import io

spoons_dir = "spoons"
output = []

with open("spoons.json", "r") as f:
    existing = json.load(f)

existing_map = {s["filename"]: s for s in existing}

for filename in sorted(os.listdir(spoons_dir)):
    if filename.endswith(".png"):
        path = os.path.join(spoons_dir, filename)
        img = Image.open(path).convert("RGBA")
        img.thumbnail((150, 150))
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode()
        
        entry = existing_map.get(filename, {"filename": filename})
        entry["thumbnail"] = b64
        output.append(entry)
        print(f"processed {filename}")

with open("spoons.json", "w") as f:
    json.dump(output, f)

print(f"done — {len(output)} spoons")