import { createFileRoute } from '@tanstack/react-router'
import { readFileSync } from 'fs'
import { join } from 'path'

export const Route = createFileRoute('/api/public/migration-report')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const filePath = join(process.cwd(), 'docs/MIGRACAO_ESTADO_ATUAL.md')
          const content = readFileSync(filePath, 'utf-8')
          return new Response(content, {
            status: 200,
            headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
          })
        } catch (e) {
          return new Response('Relatório não encontrado', { status: 404 })
        }
      }
    }
  }
})
