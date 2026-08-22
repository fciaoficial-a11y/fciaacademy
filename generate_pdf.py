
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Load the local HTML file
        file_path = f"file://{os.getcwd()}/audit.html"
        await page.goto(file_path, wait_until="networkidle")
        
        # Print to PDF
        await page.pdf(
            path="auditoria_completa_influenciador_ia_tiktok_shop.pdf",
            format="A4",
            margin={"top": "20px", "right": "20px", "bottom": "20px", "left": "20px"},
            print_background=True
        )
        
        await browser.close()
        print("PDF gerado: auditoria_completa_influenciador_ia_tiktok_shop.pdf")

if __name__ == "__main__":
    asyncio.run(main())
