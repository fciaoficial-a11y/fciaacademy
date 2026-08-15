import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import json
import os

SCREENSHOTS = Path("/tmp/browser/audit_m8_v2")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        
        await page.goto("http://localhost:8080")
        if storage_key and session_json:
            await page.evaluate(
                f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
            )
        
        # O slug do curso é 'influenciador-ia-tiktok-shop'
        url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop"
        await page.goto(url)
        await page.wait_for_load_state("networkidle")
        
        # Capturar o estado da sidebar
        await page.screenshot(path=str(SCREENSHOTS / "sidebar_state.png"))
        
        # Tentar encontrar o módulo 8 no texto da página
        modules_text = await page.evaluate("Array.from(document.querySelectorAll('button, a')).map(el => el.innerText)")
        print("Botões/Links encontrados:", [t for t in modules_text if "Módulo" in t])

        # Se o link estiver lá, clica usando seletor de texto
        try:
            # O texto pode ser "08 · TEXT 20m Módulo 8: Roteiros de Conteúdo e Vídeos que Vendem"
            await page.get_by_text("Módulo 8: Roteiros").click(timeout=5000)
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=str(SCREENSHOTS / "m8_content.png"))
            
            content = await page.locator("main").text_content()
            print(f"M8 Content Length: {len(content)}")
            
            video = await page.locator("video, iframe").count()
            print(f"Videos/Iframes found: {video}")
            
        except Exception as e:
            print(f"Could not click M8: {str(e)}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
