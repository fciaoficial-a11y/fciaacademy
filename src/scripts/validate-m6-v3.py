import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Tentar obter sessão injetada pelo Lovable
        storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        
        # Estabelecer a origem primeiro
        await page.goto("http://localhost:8080")
        
        if storage_key and session_json:
            print("Restaurando sessão Supabase injetada...")
            await page.evaluate(
                f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
            )

        # Usar o slug correto para o Módulo 6
        target_url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop?m=influenciador-ia-m6"
        
        print(f"Navegando para {target_url}")
        await page.goto(target_url, wait_until="networkidle")
        
        # Aguardar o conteúdo renderizar
        try:
            await page.wait_for_selector("h2", timeout=15000)
            print("Cabeçalhos H2 detectados.")
        except Exception as e:
            print(f"Erro ao esperar H2: {e}")
            # Tirar screenshot para debug
            await page.screenshot(path="/tmp/browser/fcia/error_m6.png")
            print("Screenshot de erro salva em /tmp/browser/fcia/error_m6.png")
            await browser.close()
            return

        # Contar blocos H2
        h2_elements = await page.query_selector_all("h2")
        count = len(h2_elements)
        print(f"Detectados {count} blocos H2 no Módulo 6.")
        
        # Verificar palavras-chave obrigatórias
        content = await page.content()
        keywords = ["VÍDEO NÃO É UMA IMAGEM EM MOVIMENTO", "STORYBOARD E SHOT LIST", "PROMPTS COMPLETOS"]
        for kw in keywords:
            if kw in content:
                print(f"Palavra-chave encontrada: {kw}")
            else:
                print(f"AVISO: Palavra-chave NÃO encontrada: {kw}")

        # Verificar ausência do player de vídeo
        video_player = await page.query_selector("video")
        iframe_player = await page.query_selector("iframe")
        if not video_player and not iframe_player:
            print("Sucesso: Nenhum player de vídeo detectado.")
        else:
            print("ERRO: Player de vídeo encontrado na página!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
