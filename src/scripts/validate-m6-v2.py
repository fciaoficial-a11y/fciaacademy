import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Usar o slug correto para o Módulo 6
        target_url = "http://localhost:8080/curso/influenciador-ia-tiktok-shop?m=influenciador-ia-m6"
        
        # Como o usuário já está logado no preview, tentamos acesso direto
        # Caso precise de sessão, o sistema Lovable cuida da injeção se configurado, 
        # mas aqui assumimos que o preview já está autenticado ou o componente permite visualização admin.
        
        await page.goto(target_url, wait_until="networkidle")
        
        # Aguardar o conteúdo renderizar
        await page.wait_for_selector("h2")
        
        # Contar blocos H2 (que representam nossos blocos de conteúdo)
        h2_elements = await page.query_selector_all("h2")
        count = len(h2_elements)
        print(f"Detectados {count} blocos H2 no Módulo 6.")
        
        # Verificar palavras-chave obrigatórias para garantir profundidade
        content = await page.content()
        keywords = ["VÍDEO NÃO É UMA IMAGEM EM MOVIMENTO", "ESTRUTURA DE VÍDEO CURTO", "STORYBOARD E SHOT LIST", "PROMPTS COMPLETOS"]
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
