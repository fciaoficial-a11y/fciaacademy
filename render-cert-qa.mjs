import QRCode from 'qrcode';
import { renderCertificatePdf } from '/dev-server/src/lib/certificate-templates.ts';

const url = 'https://fciaacademy.lovable.app/validar-certificado/FCIA-TEST-2026';
const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1, width: 320, color: { dark: '#0b0f1e', light: '#ffffff' }});
const qrPng = Uint8Array.from(atob(dataUrl.split(',')[1]), c => c.charCodeAt(0));

const ctx = {
  studentName: 'Fernando Cabral Silva',
  courseTitle: 'IA Sem Mistério — Fundamentos Aplicados',
  workloadHours: 60,
  completionDate: '15 de janeiro de 2026',
  issuedDate: '18 de janeiro de 2026',
  validationCode: 'FCIA-9K7M-2X4P',
  verificationUrl: url,
  institutionName: 'FCIA Academy',
  trackTitle: 'Inteligência Artificial',
  certificateTitle: 'Certificado de Conclusão',
  bodyText: 'A FCIA Academy certifica que o(a) aluno(a) concluiu com aproveitamento o curso livre de capacitação e atualização profissional, com carga horária total de 60 horas.',
  legalFooter: 'Curso livre de capacitação e atualização profissional, sem equivalência a diploma de curso técnico, graduação ou pós-graduação, e sem declaração de reconhecimento pelo MEC.',
  issuerName: 'Prof. Fernando Cabral',
  issuerRole: 'CEO & Founder — FCIA',
  qrPng,
};

const bytes = await renderCertificatePdf('dark_premium_tech', ctx);
import('fs').then(fs => fs.writeFileSync('/tmp/certqa/dark.pdf', bytes));
console.log('ok', bytes.length);
