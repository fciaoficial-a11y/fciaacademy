import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path("/tmp/browser/check_m2")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Login como admin
        await page.goto("http://localhost:8080/auth")
        await page.fill('input[type="email"]', "blindadoemotivado@gmail.com")
        await page.fill('input[type="password"]', "estrada26")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard")
        
        # Navegar para o Módulo 2
        # URL pattern: /curso/influenciador-ia-tiktok-shop?m=modulo-2-estrategia-posicionamento
        target_url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop?m=modulo-2-estrategia-posicionamento"
        await page.goto(target_url)
        await page.wait_for_load_state("networkidle")
        
        await page.screenshot(path=str(SCREENSHOTS / "m2_render.png"))
        
        # Verificar presença de blocos obrigatórios
        content = await page.content()
        blocks_to_check = [
            "ESTRATÉGIA ANTES DA IDENTIDADE",
            "MÉTODO P.R.O.V.A.",
            "DEFINIÇÃO DE PÚBLICO PRIORITÁRIO",
            "MAPA DE CONTEXTO DE COMPRA",
            "DORES, DESEJOS, OBJEÇÕES E GATILHOS",
            "PROPOSTA DE VALOR E POSICIONAMENTO",
            "CATEGORIA DE PRODUTOS E FUNÇÃO COMERCIAL",
            "ARQUÉTIPO E PERSONALIDADE ESTRATÉGICA",
            "PILARES E FORMATOS DE CONTEÚDO",
            "BIBLIOTECA DE 20 PROMPTS AI-TO-AI",
            "PROJETO PRÁTICO: DOSSIÊ ESTRATÉGICO",
            "CHECKLIST DE APROVAÇÃO E TRANSIÇÃO"
        ]
        
        missing = []
        for block in blocks_to_check:
            if block not in content:
                missing.append(block)
        
        if missing:
            print(f"ERRO: Blocos ausentes: {', '.join(missing)}")
        else:
            print("SUCESSO: Todos os 12 blocos premium detectados.")

        # Verificar se o vídeo está oculto
        video_exists = await page.query_selector("video") or await page.query_selector("iframe[src*='video']")
        if video_exists:
            print("ERRO: Player de vídeo detectado, deveria estar oculto.")
        else:
            print("SUCESSO: Video player ausente conforme instrução.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
