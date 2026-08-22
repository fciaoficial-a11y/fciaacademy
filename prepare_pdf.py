
import json
import os
from pathlib import Path

def create_html_for_pdf():
    md_path = Path("auditoria_completa_influenciador_ia_tiktok_shop.md")
    if not md_path.exists():
        return

    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()

    html_content = content.replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <body>
        <div style="color: red; font-weight: bold;">CÓPIA DE AUDITORIA — NÃO É FONTE DE RESTAURAÇÃO</div>
        <pre style="white-space: pre-wrap;">{content}</pre>
    </body>
    </html>
    """
    
    with open("audit.html", "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    create_html_for_pdf()
