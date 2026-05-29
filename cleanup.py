import os
import re

SRC_DIR = "src"

print("Starte den automatischen Hausputz im src/ Ordner...")

for filename in os.listdir(SRC_DIR):
    if not filename.endswith(".html"):
        continue
        
    filepath = os.path.join(SRC_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Header ersetzen
    content = re.sub(r"<header>.*?</header>", "<!-- INCLUDE_HEADER -->", content, flags=re.DOTALL)
    
    # 2. Sidebar ersetzen
    content = re.sub(r'<aside class="sidebar">.*?</aside>', "<!-- INCLUDE_SIDEBAR -->", content, flags=re.DOTALL)
    
    # 3. Footer und Modals ersetzen
    content = re.sub(r"<footer>.*?<script src=\"js/main\.js\" defer></script>", "<!-- INCLUDE_FOOTER -->", content, flags=re.DOTALL)

    # 4. Navigation ersetzen und anhand des Dateinamens erkennen, welcher Menüpunkt aktiv sein soll
    nav_type = "none"
    if filename == "index.html": nav_type = "home"
    elif filename.startswith("music") or filename.startswith("album"): nav_type = "music"
    elif filename.startswith("creation"): nav_type = "creations"
    elif filename == "links.html": nav_type = "links"
    elif filename == "aboutme.html": nav_type = "about"
    elif filename == "contact.html": nav_type = "contact"

    content = re.sub(r"<nav>.*?</nav>", f"<!-- INCLUDE_NAV: {nav_type} -->", content, flags=re.DOTALL)

    # Datei bereinigt wieder speichern
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Fertig! Alle Dateien im src/ Ordner wurden entschlackt.")