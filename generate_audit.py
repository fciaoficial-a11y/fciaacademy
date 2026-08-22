
import json
import os
from pathlib import Path


def generate_audit_files():
    data_path = Path("/tmp/course_data.json")
    if not data_path.exists():
        print("Data file not found")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    course = data["course"]
    modules = data["modules"]

    output_name = "auditoria_completa_influenciador_ia_tiktok_shop"
    md_path = f"{output_name}.md"

    md_content = []
    md_content.append("CÓPIA DE AUDITORIA — NÃO É FONTE DE RESTAURAÇÃO\n")
    md_content.append(f"# CURSO: {course['title']}")
    md_content.append(f"- **Slug**: {course['slug']}")
    md_content.append(f"- **Status**: {'Publicado' if course.get('is_published') else 'Standby/Draft'}")
    md_content.append(f"- **Preço**: R$ {course.get('price', 0)}")
    md_content.append("\n## ÍNDICE DE MÓDULOS\n")
    
    table_header = "| Módulo | Título | Caracteres | Palavras | Linhas | Video URL |"
    table_sep = "|---        |---        |---        |---        |---        |---        |"
    md_content.append(table_header)
    md_content.append(table_sep)

    module_sections = []
    total_chars = 0
    modules_count = 0

    for m in modules:
        modules_count += 1
        title = m.get("title", "Sem Título")
        desc = m.get("description", "Sem Descrição")
        content = m.get("content_text", "")
        video = m.get("video_url", "N/A")
        idx = m.get("sort_order", 0)

        # Build full module string for stats
        prompts = json.dumps(m.get("prompts", []), indent=2, ensure_ascii=False)
        materials = json.dumps(m.get("materials", []), indent=2, ensure_ascii=False)
        activities = json.dumps(m.get("activities", []), indent=2, ensure_ascii=False)
        
        full_text = f"{content}\n\nPROMPTS:\n{prompts}\n\nMATERIAIS:\n{materials}\n\nATIVIDADES:\n{activities}"
        
        chars = len(full_text)
        words = len(full_text.split())
        lines = len(full_text.splitlines())
        total_chars += chars

        md_content.append(f"| {idx} | {title} | {chars} | {words} | {lines} | {video} |")

        sec = [
            f"\n---\n## MÓDULO {idx}: {title}",
            f"**Descrição**: {desc}",
            f"**Video URL**: {video}\n",
            "### CONTEÚDO INTEGRAL",
            content,
            "\n### PROMPTS",
            f"```json\n{prompts}\n```",
            "\n### MATERIAIS",
            f"```json\n{materials}\n```",
            "\n### ATIVIDADES",
            f"```json\n{activities}\n```"
        ]
        module_sections.append("\n".join(sec))

    md_content.append(f"\n**TOTAL DE CARACTERES EXPORTADOS**: {total_chars}\n")
    md_content.extend(module_sections)

    full_md = "\n".join(md_content)
    
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(full_md)

    print(f"Markdown gerado: {md_path}")
    print(f"Módulos exportados: {modules_count}")
    print(f"Caracteres totais: {total_chars}")

if __name__ == "__main__":
    generate_audit_files()
