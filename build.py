import os
import re

# Pfade definieren
SRC_DIR = "src"
COMPONENTS_DIR = "components"
OUT_DIR = "."  # Bleibt auf Root, damit GitHub Pages ohne extra Konfiguration direkt funktioniert!

def load_component(name):
    filepath = os.path.join(COMPONENTS_DIR, f"{name}.html")
    
    # Der Sicherheits-Check: Gibt eine saubere Meldung, falls du eine Datei aus Versehen löschst
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"❌ Fehler: Komponente fehlt -> {filepath}")
        
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

print("Lade HTML-Bausteine...")
header_html = load_component("header")
sidebar_html = load_component("sidebar")
footer_html = load_component("footer")
nav_template = load_component("nav")

html_files = sorted(f for f in os.listdir(SRC_DIR) if f.endswith(".html"))
print(f"Verarbeite {len(html_files)} Dateien...")

for filename in html_files:
    with open(os.path.join(SRC_DIR, filename), "r", encoding="utf-8") as f:
        content = f.read()
        
    # 1. Normale Platzhalter durch Bausteine ersetzen
    content = content.replace("<!-- INCLUDE_HEADER -->", header_html)
    content = content.replace("<!-- INCLUDE_SIDEBAR -->", sidebar_html)
    content = content.replace("<!-- INCLUDE_FOOTER -->", footer_html)
    
    # 2. Navigation inkl. Active State ersetzen
    nav_match = re.search(r"<!--\s*INCLUDE_NAV:\s*([A-Z0-9_-]+)\s*-->", content, re.IGNORECASE)
    if nav_match:
        active_page = nav_match.group(1).upper()
        nav_current = nav_template
        
        # Leuchtet den korrekten Menüpunkt auf
        pages = ["HOME", "MUSIC", "CREATIONS", "LINKS", "ABOUT", "CONTACT"]
        for p in pages:
            if p == active_page:
                nav_current = nav_current.replace(f"[ACTIVE_{p}]", "nav-active")
            else:
                nav_current = nav_current.replace(f"[ACTIVE_{p}]", "")
                
        # Entfernt übrig gebliebene [ACTIVE_...] Platzhalter (falls du mal Menüpunkte ergänzt)
        nav_current = re.sub(r"\[ACTIVE_[A-Z0-9_-]+\]", "", nav_current)
        
        content = content.replace(nav_match.group(0), nav_current)
        
    # 3. Warnung bei unersetzten Platzhaltern (Tippfehler-Schutz)
    remaining = re.findall(r"<!--\s*INCLUDE_[A-Z:_ -]+\s*-->", content, re.IGNORECASE)
    if remaining:
        print(f"⚠️ Warnung in {filename}: Nicht ersetzte Platzhalter gefunden: {remaining}")
        
    # Speichern der fertigen Datei im Hauptverzeichnis
    with open(os.path.join(OUT_DIR, filename), "w", encoding="utf-8") as f:
        f.write(content)

print("Fertig! 🚀 Alle HTML-Dateien wurden generiert.")