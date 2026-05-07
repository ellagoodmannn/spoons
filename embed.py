import os
import json
import torch
import clip
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

spoons_dir = "spoons"
output = []

for filename in sorted(os.listdir(spoons_dir)):
    if filename.endswith(".png"):
        path = os.path.join(spoons_dir, filename)
        image = preprocess(Image.open(path).convert("RGB")).unsqueeze(0).to(device)
        
        with torch.no_grad():
            embedding = model.encode_image(image)
            embedding = embedding / embedding.norm(dim=-1, keepdim=True)
        
        output.append({
            "filename": filename,
            "embedding": embedding[0].tolist()
        })
        print(f"processed {filename}")

with open("spoons.json", "w") as f:
    json.dump(output, f)

print(f"done — {len(output)} spoons embedded")