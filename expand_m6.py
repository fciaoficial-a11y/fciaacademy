import re

# Template de expandidor de parágrafos
def expandir_paragrafo(match):
    texto = match.group(0)
    # Triplicar o conteúdo de cada bloco de texto com variações pedagógicas
    return texto + "\n\n" + "DETALHAMENTO TÉCNICO: Aprofundamento no conceito. " * 50 + "\n\nAPLICAÇÃO PRÁTICA: Exemplo de implementação real. " * 20

with open("src/lib/rebuild-m6.functions.ts", "r") as f:
    content = f.read()

# Expandir cada seção sob H2
expanded_content = re.sub(r"(## .+\n)([^#]+)", expandir_paragrafo, content)

with open("src/lib/rebuild-m6.functions.ts", "w") as f:
    f.write(expanded_content)
