import type { Dc3PdfData } from './pdf';

/**
 * Mock DC-3 certificates used to seed the public certificate-lookup page
 * when the `certificates` table doesn't yet contain a matching folio.
 *
 * Mirrors `frontend/src/lib/certificates.ts` so the marketing site is fully
 * functional end-to-end (search → view details → download real PDF).
 */
export const MOCK_CERTIFICATES: Dc3PdfData[] = [
  {
    folio: 'PCH-2026-000101',
    holderName: 'María Fernanda López',
    holderCurp: 'LOFM880912MDFPNR03',
    courseName: 'Trabajos en altura — Prevención de caídas',
    nomCode: 'NOM-009-STPS',
    hours: 16,
    issuedAt: '2026-01-14',
    expiresAt: '2027-01-14',
    stpsRegistration: 'ACE-2024-0871',
    trainerName: 'Ing. Alejandra Sánchez Ruiz',
    companyName: 'PROCHECK Safety S.A. de C.V.',
  },
  {
    folio: 'PCH-2026-000102',
    holderName: 'Carlos Ramírez Ortega',
    holderCurp: null,
    courseName: 'Equipo de Protección Personal',
    nomCode: 'NOM-017-STPS',
    hours: 8,
    issuedAt: '2025-10-22',
    expiresAt: '2026-10-22',
    stpsRegistration: 'ACE-2024-0871',
    trainerName: 'Ing. Alejandra Sánchez Ruiz',
    companyName: 'PROCHECK Safety S.A. de C.V.',
  },
  {
    folio: 'PCH-2025-000501',
    holderName: 'Ana Sofía Gutiérrez',
    holderCurp: null,
    courseName: 'Prevención, protección y combate de incendios',
    nomCode: 'NOM-002-STPS',
    hours: 12,
    issuedAt: '2025-03-01',
    expiresAt: '2026-03-01',
    stpsRegistration: 'ACE-2024-0871',
    trainerName: 'Ing. Alejandra Sánchez Ruiz',
    companyName: 'PROCHECK Safety S.A. de C.V.',
  },
  {
    folio: 'PCH-2026-000110',
    holderName: 'José Luis Hernández',
    holderCurp: null,
    courseName: 'Bloqueo y etiquetado (LOTO)',
    nomCode: 'LOTO-101',
    hours: 8,
    issuedAt: '2026-05-18',
    expiresAt: '2027-05-18',
    stpsRegistration: 'ACE-2024-0871',
    trainerName: 'Ing. Alejandra Sánchez Ruiz',
    companyName: 'PROCHECK Safety S.A. de C.V.',
  },
  {
    folio: 'PCH-2026-000121',
    holderName: 'Patricia Núñez',
    holderCurp: null,
    courseName: 'Comisiones de Seguridad e Higiene',
    nomCode: 'NOM-019-STPS',
    hours: 10,
    issuedAt: '2026-04-02',
    expiresAt: '2027-04-02',
    stpsRegistration: 'ACE-2024-0871',
    trainerName: 'Ing. Alejandra Sánchez Ruiz',
    companyName: 'PROCHECK Safety S.A. de C.V.',
  },
  {
    folio: 'PCH-2026-000144',
    holderName: 'Roberto Cárdenas',
    holderCurp: null,
    courseName: 'Uso y manejo de extintores',
    nomCode: 'EXT-101',
    hours: 6,
    issuedAt: '2026-06-11',
    expiresAt: '2026-12-11',
    stpsRegistration: 'ACE-2024-0871',
    trainerName: 'Ing. Alejandra Sánchez Ruiz',
    companyName: 'PROCHECK Safety S.A. de C.V.',
  },
];
