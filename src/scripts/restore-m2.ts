import { forceRebuildModule2Premium } from './rebuild-m2.functions';

async function run() {
  console.log('Iniciando reconstrução premium do Módulo 2...');
  try {
    const result = await forceRebuildModule2Premium();
    console.log('Sucesso:', result);
    process.exit(0);
  } catch (err) {
    console.error('Erro na reconstrução:', err);
    process.exit(1);
  }
}

run();
