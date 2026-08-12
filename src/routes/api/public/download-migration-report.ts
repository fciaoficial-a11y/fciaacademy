import { createFileRoute } from '@tanstack/react-router'
import { readFileSync } from 'fs'
import { join } from 'path'

export const Route = createFileRoute('/api/public/download-migration-report')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const filePath = join(process.cwd(), 'docs/MIGRACAO_ESTADO_ATUAL.md')
          const content = readFileSync(filePath, 'utf-8')
          
          return new Response(content, {
            status: 200,
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
              'Content-Disposition': 'attachment; filename="MIGRACAO_ESTADO_ATUAL.md"',
            },
          })
        } catch (error) {
          return new Response('Arquivo não encontrado', { status: 404 })
        }
      }
    }
  }
})
