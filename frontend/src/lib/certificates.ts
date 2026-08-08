export type CertificateStatus = "vigente" | "por-vencer" | "vencido";

export type Certificate = {
  folio: string;
  curso: string;
  emision: string; // YYYY-MM-DD
  vencimiento: string; // YYYY-MM-DD
  estado: CertificateStatus;
  titular: string;
  curp?: string;
};

export const certificates: Certificate[] = [
  {
    folio: "PCH-2026-000101",
    curso: "NOM-009-STPS Trabajos en altura",
    emision: "2026-01-14",
    vencimiento: "2027-01-14",
    estado: "vigente",
    titular: "María Fernanda López",
    curp: "LOFM880912MDFPNR03",
  },
  {
    folio: "PCH-2026-000102",
    curso: "NOM-017-STPS EPP",
    emision: "2025-10-22",
    vencimiento: "2026-10-22",
    estado: "por-vencer",
    titular: "Carlos Ramírez Ortega",
  },
  {
    folio: "PCH-2025-000501",
    curso: "NOM-002-STPS Prevención de incendios",
    emision: "2025-03-01",
    vencimiento: "2026-03-01",
    estado: "vencido",
    titular: "Ana Sofía Gutiérrez",
  },
  {
    folio: "PCH-2026-000110",
    curso: "LOTO-101 Bloqueo y etiquetado",
    emision: "2026-05-18",
    vencimiento: "2027-05-18",
    estado: "vigente",
    titular: "José Luis Hernández",
  },
  {
    folio: "PCH-2026-000121",
    curso: "NOM-019-STPS Comisiones de Seguridad e Higiene",
    emision: "2026-04-02",
    vencimiento: "2027-04-02",
    estado: "vigente",
    titular: "Patricia Núñez",
  },
  {
    folio: "PCH-2026-000144",
    curso: "EXT-101 Uso y manejo de extintores",
    emision: "2026-06-11",
    vencimiento: "2026-12-11",
    estado: "por-vencer",
    titular: "Roberto Cárdenas",
  },
];
