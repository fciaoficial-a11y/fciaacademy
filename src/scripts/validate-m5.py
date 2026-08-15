import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path("/tmp/browser/check_m5_final/screenshots")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Login
        print("Authenticating...")
        storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        
        await page.goto("http://localhost:8080")
        if storage_key and session_json:
            await page.evaluate(
                f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
            )
            print("Session restored.")
        else:
            print("WARNING: No session vars found. Testing as guest.")

        # Navigate to Module 5
        target_url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop?m=influenciador-ia-m5"
        print(f"Navigating to {target_url}")
        await page.goto(target_url, wait_until="networkidle")
        
        # Give some time for rendering
        await page.wait_for_timeout(2000)
        
        await page.screenshot(path=str(SCREENSHOTS / "1_module_page.png"))
        
        # Check for H2 blocks (we expect around 14 based on previous modules)
        h2_elements = await page.query_selector_all("h2")
        h2_texts = [await h.inner_text() for h in h2_elements]
        print(f"Found {len(h2_texts)} H2 blocks:")
        for t in h2_texts:
            print(f"- {t}")

        # Check for key commercial terms
        text_content = await page.evaluate("document.body.innerText")
        keywords = ["BIBLIOTECA COMERCIAL", "PROVA", "BRIEFING VISUAL", "AREA_SEGURA"]
        
        for kw in keywords:
            found = kw in text_content or kw.upper() in text_content or kw.lower() in text_content
            print(f"Keyword '{kw}' found: {found}")
        
        # Test exact strings for confirmation
        print(f"DEBUG: 'METODO PROVA' in text: {'METODO PROVA' in text_content}")
        print(f"DEBUG: 'AREA SEGURA' in text: {'AREA SEGURA' in text_content}")
        print(f"DEBUG: 'MÉTODO P.R.O.V.A.' in text: {'MÉTODO P.R.O.V.A.' in text_content}")





        # Check for video player (should be absent)
        video_exists = await page.query_selector("iframe") or await page.query_selector("video")
        print(f"Video element found: {video_exists is not None}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
