import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import json
import os

SCREENSHOTS = Path("/tmp/browser/audit_m8")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Injetar sessão do admin para auditar
        storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        
        await page.goto("http://localhost:8080")
        if storage_key and session_json:
            await page.evaluate(
                f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
            )
        
        # Acessar o curso (estando em standby, o admin deve conseguir ver)
        # O slug do curso é 'influenciador-ia-tiktok-shop'
        # O slug do módulo 8 é 'influenciador-ia-m8'
        url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop"
        await page.goto(url)
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path=str(SCREENSHOTS / "1_course_view.png"))

        # Procurar o link do módulo 8
        m8_link = page.get_by_role("link", name="Módulo 8", exact=False)
        if await m8_link.is_visible():
            await m8_link.click()
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=str(SCREENSHOTS / "2_module_8_content.png"))
            
            # Verificar ausência de vídeo
            video_exists = await page.locator("video, iframe[src*='youtube'], iframe[src*='vimeo']").is_visible()
            print(f"Video detected: {video_exists}")
            
            # Verificar densidade de conteúdo (aproximado pelo texto visível)
            content_text = await page.locator("main").text_content()
            print(f"Content length (visible): {len(content_text) if content_text else 0}")
        else:
            print("Module 8 link not found in sidebar/list.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
