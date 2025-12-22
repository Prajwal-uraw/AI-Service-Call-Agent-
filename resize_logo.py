"""
Logo Resizer Script
Resizes logo to appropriate sizes for navigation and favicon
"""

from PIL import Image
import os

def resize_logo():
    # Input and output paths
    input_path = "frontend/public/logo.svg"
    
    # Check if SVG exists, if not try PNG
    if not os.path.exists(input_path):
        input_path = "frontend/public/logo.png"
    
    if not os.path.exists(input_path):
        print("❌ No logo file found (logo.svg or logo.png)")
        return
    
    # If it's SVG, we don't need to resize (SVG is scalable)
    if input_path.endswith('.svg'):
        print("✅ Logo is SVG format - no resizing needed (scalable)")
        print(f"   Using: {input_path}")
        return
    
    # For PNG/JPG, create multiple sizes
    try:
        img = Image.open(input_path)
        print(f"✅ Original logo size: {img.size}")
        
        # Navigation logo (height 40px, maintain aspect ratio)
        nav_height = 40
        aspect_ratio = img.width / img.height
        nav_width = int(nav_height * aspect_ratio)
        nav_logo = img.resize((nav_width, nav_height), Image.Resampling.LANCZOS)
        nav_logo.save("frontend/public/logo-nav.png")
        print(f"✅ Created navigation logo: {nav_width}x{nav_height}px")
        
        # Favicon (32x32)
        favicon = img.resize((32, 32), Image.Resampling.LANCZOS)
        favicon.save("frontend/public/favicon.png")
        print(f"✅ Created favicon: 32x32px")
        
        # Large logo for login (height 64px)
        login_height = 64
        login_width = int(login_height * aspect_ratio)
        login_logo = img.resize((login_width, login_height), Image.Resampling.LANCZOS)
        login_logo.save("frontend/public/logo-large.png")
        print(f"✅ Created login logo: {login_width}x{login_height}px")
        
        print("\n✅ All logo sizes created successfully!")
        
    except Exception as e:
        print(f"❌ Error resizing logo: {e}")

if __name__ == "__main__":
    resize_logo()
