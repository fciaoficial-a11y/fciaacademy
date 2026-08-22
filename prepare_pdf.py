
import json
import os
from pathlib import Path

def create_html_for_pdf():
    md_path = Path("auditoria_completa_influenciador_ia_tiktok_shop.md")
    if not md_path.exists():
        return

    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Very basic MD to HTML conversion for the audit
    html_content = content.replace("\n", "<br>").replace("###", "<h3>").replace("##", "<h2>").replace("#", "<h1>")
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 40px; }}
            h1, h2, h3 {{ color: #000; page-break-before: always; }}
            h1:first-child {{ page-break-before: avoid; }}
            pre {{ background: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .audit-header {{ font-weight: bold; color: red; margin-bottom: 20px; }}
        </style>
    </head>
    <body>
        <div class="audit-header">CÓPIA DE AUDITORIA — NÃO É FONTE DE RESTAURAÇÃO</div>
        {html_content}
    </body>
    </html>
    """
    
    with open("audit.html", "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    create_html_for_pdf()
