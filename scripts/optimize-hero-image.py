"""
DEPRECATED: This single-resolution Pillow script is superseded by multi-resolution
responsive asset generation (640w, 960w, 1280w in AVIF, WebP, JPEG).
See public/assets/hero/ for the responsive assets.
"""
import os
from PIL import Image

def optimize_hero():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_path = os.path.join(base_dir, "public", "assets", "hero-hai-van.jpg")
    output_webp = os.path.join(base_dir, "public", "assets", "hero-hai-van.webp")
    output_avif = os.path.join(base_dir, "public", "assets", "hero-hai-van.avif")

    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    img = Image.open(input_path)
    print(f"Original: {img.size}, format: {img.format}, size: {os.path.getsize(input_path)} bytes")

    # Save as WebP
    img.save(output_webp, "WEBP", quality=85, method=6)
    print(f"Saved WebP: {output_webp}, size: {os.path.getsize(output_webp)} bytes")

    # Save as AVIF
    img.save(output_avif, "AVIF", quality=80)
    print(f"Saved AVIF: {output_avif}, size: {os.path.getsize(output_avif)} bytes")

if __name__ == "__main__":
    optimize_hero()
