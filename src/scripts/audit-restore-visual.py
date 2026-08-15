import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import json
import os

SCREENSHOTS = Path("/tmp/browser/audit_restore")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Auth session injection
        # Note: Using LOVABLE_BROWSER_SUPABASE_SESSION_JSON if available
        session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        
        await page.goto("http://localhost:8080")
        if session_json and storage_key:
             await page.evaluate(
                f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
            )
        
        slug = "influenciador-ia-tiktok-shop"
        modules = [
            {"num": 3, "slug": "influenciador-ia-m3", "expected": "Identidade"},
            {"num": 4, "slug": "influenciador-ia-m4", "expected": "Consistência Visual"},
            {"num": 5, "slug": "influenciador-ia-m5", "expected": "Produção de Imagens"},
            {"num": 8, "slug": "influenciador-ia-m8", "expected": "Roteiros"},
            {"num": 11, "slug": "influenciador-ia-m11", "expected": "Operação"}
        ]

        print(f"--- Auditoria Visual: {slug} ---")
        
        for mod in modules:
            url = f"http://localhost:8080/curso/{slug}?module={mod['slug']}"
            await page.goto(url, wait_until="networkidle")
            await asyncio.sleep(2) # Wait for content to render
            
            # Check if content is present
            content = await page.content()
            chars = len(content)
            
            # Verify specific keywords
            found_expected = mod['expected'] in content
            
            path = SCREENSHOTS / f"module_{mod['num']}.png"
            await page.screenshot(path=str(path))
            print(f"Módulo {mod['num']}: {chars} chars na página. Keyword '{mod['expected']}' encontrada: {found_expected}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
