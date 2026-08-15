import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import json
import os

SCREENSHOTS = Path("/tmp/browser/audit_m8_v3")
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
        
        url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop"
        await page.goto(url)
        await page.wait_for_load_state("networkidle")
        
        # Clicar no link do Módulo 8
        try:
            # O log mostrou: '09\n·\n0M\n\nMódulo 8: Roteiros de Conteúdo e Vídeos que Vendem'
            await page.get_by_text("Módulo 8: Roteiros").click(timeout=5000)
            await page.wait_for_load_state("networkidle")
            
            # Capturar apenas o conteúdo do artigo para evitar ambiguidade com AppShell main
            article = page.locator("article")
            content = await article.text_content()
            print(f"M8 Visible Text Length: {len(content) if content else 0}")
            
            # Verificando H2s para garantir profundidade
            h2_count = await article.locator("h2").count()
            print(f"H2 Count: {h2_count}")
            
            # Verificando ausência de vídeo
            video = await article.locator("video, iframe").count()
            print(f"Videos/Iframes in Article: {video}")
            
            await page.screenshot(path=str(SCREENSHOTS / "m8_verified.png"))
            
        except Exception as e:
            print(f"Audit failed: {str(e)}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
