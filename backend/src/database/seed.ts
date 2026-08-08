import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { User } from '../modules/users/user.entity';
import { Course } from '../modules/courses/course.entity';
import { VendorProfile } from '../modules/sales/entities/vendor-profile.entity';
import { SalesLead } from '../modules/sales/entities/sales-lead.entity';
import { SalesDeal } from '../modules/sales/entities/sales-deal.entity';
import { Commission } from '../modules/sales/entities/commission.entity';
import { TrainerProfile } from '../modules/training/entities/trainer-profile.entity';
import { TrainingSession } from '../modules/training/entities/training-session.entity';
import { Appointment } from '../modules/training/entities/appointment.entity';
import { LibraryDocument } from '../modules/library/entities/library-document.entity';
import { LibraryPurchase } from '../modules/library/entities/library-purchase.entity';
import { LibraryDownload } from '../modules/library/entities/library-download.entity';
import { Role } from '../common/roles';

loadEnv();

const PACKAGE_TIER_RULE = {
  type: 'package_tier',
  package_tiers: [
    { package: 'basico', pct: 10 },
    { package: 'plus', pct: 12 },
    { package: 'enterprise', pct: 15 },
  ],
};

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'procheeck',
    entities: [
      User,
      Course,
      VendorProfile,
      SalesLead,
      SalesDeal,
      Commission,
      TrainerProfile,
      TrainingSession,
      Appointment,
      LibraryDocument,
      LibraryPurchase,
      LibraryDownload,
    ],
    synchronize: false,
  });

  await ds.initialize();

  // Ensure roles are present (migration should have done this).
  await ds.query(
    `INSERT INTO roles (code, label_es, label_en) VALUES
      ('vendedor','Vendedor','Seller'),
      ('capacitador','Capacitador','Trainer')
     ON CONFLICT (code) DO NOTHING`,
  );

  const users = ds.getRepository(User);
  const courses = ds.getRepository(Course);
  const vendors = ds.getRepository(VendorProfile);
  const trainers = ds.getRepository(TrainerProfile);
  const leads = ds.getRepository(SalesLead);
  const deals = ds.getRepository(SalesDeal);
  const commissions = ds.getRepository(Commission);
  const sessions = ds.getRepository(TrainingSession);
  const appointments = ds.getRepository(Appointment);

  const userSeeds = [
    { email: 'admin@procheeck.mx',        role: Role.PRINCIPAL_ADMIN, first: 'Principal',   last: 'Admin' },
    { email: 'client@procheeck.mx',       role: Role.CLIENT,          first: 'Cliente',     last: 'Demo' },
    { email: 'client-admin@procheeck.mx', role: Role.CLIENT_ADMIN,    first: 'Cliente',     last: 'Admin' },
    { email: 'sub@procheeck.mx',          role: Role.SUBCONTRACTOR,   first: 'Sub',         last: 'Contratista' },
    { email: 'employee@procheeck.mx',     role: Role.EMPLOYEE,        first: 'Empleado',    last: 'Demo' },
  ];

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Users:');
  for (const s of userSeeds) {
    const existing = await users.findOne({ where: { email: s.email } });
    if (existing) {
      console.log(`  ~ exists: ${s.email}`);
      continue;
    }
    await users.insert({
      email: s.email,
      passwordHash,
      firstName: s.first,
      lastName: s.last,
      role: s.role,
      locale: 'es',
      isActive: true,
    });
    console.log(`  + created: ${s.email} (${s.role})`);
  }

  const courseSeeds = [
    { slug: 'nom-009-trabajos-en-altura', titleEs: 'NOM-009-STPS Trabajos en altura', titleEn: 'NOM-009-STPS Working at heights', descriptionEs: 'Condiciones de seguridad para realizar trabajos en altura.', nomReference: 'NOM-009-STPS-2011', priceMxn: 850, durationHours: 8, validityMonths: 24 },
    { slug: 'nom-017-epp', titleEs: 'NOM-017-STPS Equipo de protección personal', titleEn: 'NOM-017-STPS Personal protective equipment', descriptionEs: 'Selección, uso y manejo de EPP en los centros de trabajo.', nomReference: 'NOM-017-STPS-2008', priceMxn: 650, durationHours: 4, validityMonths: 24 },
    { slug: 'nom-002-prevencion-incendios', titleEs: 'NOM-002-STPS Prevención y protección contra incendios', titleEn: 'NOM-002-STPS Fire prevention & protection', descriptionEs: 'Condiciones de seguridad para prevención y protección contra incendios.', nomReference: 'NOM-002-STPS-2010', priceMxn: 750, durationHours: 6, validityMonths: 12 },
    { slug: 'nom-019-comisiones-seguridad', titleEs: 'NOM-019-STPS Comisiones de seguridad e higiene', titleEn: 'NOM-019-STPS Health & safety committees', descriptionEs: 'Constitución, integración, organización y funcionamiento de las comisiones.', nomReference: 'NOM-019-STPS-2011', priceMxn: 550, durationHours: 4, validityMonths: 24 },
    { slug: 'nom-036-factores-ergonomicos', titleEs: 'NOM-036-STPS Factores de riesgo ergonómico', titleEn: 'NOM-036-STPS Ergonomic risk factors', descriptionEs: 'Identificación, análisis, prevención y control de factores de riesgo ergonómico.', nomReference: 'NOM-036-1-STPS-2018', priceMxn: 700, durationHours: 6, validityMonths: 24 },
  ];

  console.log('\nCourses:');
  for (const c of courseSeeds) {
    const existing = await courses.findOne({ where: { slug: c.slug } });
    if (existing) {
      console.log(`  ~ exists: ${c.slug}`);
      continue;
    }
    await courses.insert({ ...c, isPublished: true });
    console.log(`  + created: ${c.slug}`);
  }

  // ============================================================
  // Vendedores
  // ============================================================
  const vendedorSeeds = [
    { email: 'ale.ibarra@procheck.mx', first: 'Alejandra', last: 'Ibarra Núñez', spec: ['Construcción y consultoría STPS'] },
    { email: 'mauricio.herrera@procheck.mx', first: 'Mauricio', last: 'Herrera Villalobos', spec: ['Química y metal-mecánica'] },
    { email: 'renata.solis@procheck.mx', first: 'Renata', last: 'Solís Guerrero', spec: ['Minería y ergonomía'] },
  ];
  const demoHash = await bcrypt.hash('demo1234', 10);
  const vendedorUsers: User[] = [];

  console.log('\nVendedores:');
  for (const v of vendedorSeeds) {
    let user = await users.findOne({ where: { email: v.email } });
    if (!user) {
      user = await users.save(users.create({
        email: v.email,
        passwordHash: demoHash,
        firstName: v.first,
        lastName: v.last,
        role: Role.VENDEDOR,
        locale: 'es',
        isActive: true,
      }));
      console.log(`  + created: ${v.email}`);
    } else {
      console.log(`  ~ exists: ${v.email}`);
    }
    vendedorUsers.push(user);

    const existingProfile = await vendors.findOne({ where: { userId: user.id } });
    if (!existingProfile) {
      await vendors.save(vendors.create({
        userId: user.id,
        quotaMonthly: 150000,
        commissionRule: PACKAGE_TIER_RULE as any,
        specialties: v.spec,
        isActive: true,
      }));
      console.log(`    + vendor_profile for ${v.email}`);
    }
  }

  // ============================================================
  // Capacitadores
  // ============================================================
  const capSeeds = [
    { email: 'fernando.reyes@procheck.mx', first: 'Ing. Fernando', last: 'Reyes Ortega', stps: 'ACE-2025-0142', spec: ['NOM-009 Alturas', 'NOM-017 EPP'] },
    { email: 'paola.guzman@procheck.mx', first: 'Dr. Paola', last: 'Guzmán Treviño', stps: 'ACE-2025-0198', spec: ['NOM-002 Incendios', 'NOM-036 Ergonomía'] },
  ];
  const capUsers: User[] = [];

  console.log('\nCapacitadores:');
  for (const c of capSeeds) {
    let user = await users.findOne({ where: { email: c.email } });
    if (!user) {
      user = await users.save(users.create({
        email: c.email,
        passwordHash: demoHash,
        firstName: c.first,
        lastName: c.last,
        role: Role.CAPACITADOR,
        locale: 'es',
        isActive: true,
      }));
      console.log(`  + created: ${c.email}`);
    } else {
      console.log(`  ~ exists: ${c.email}`);
    }
    capUsers.push(user);

    const existingProfile = await trainers.findOne({ where: { userId: user.id } });
    if (!existingProfile) {
      await trainers.save(trainers.create({
        userId: user.id,
        stpsRegistration: c.stps,
        hourlyRate: 850,
        specialties: c.spec,
        isActive: true,
      }));
      console.log(`    + trainer_profile for ${c.email}`);
    }
  }

  // ============================================================
  // Sales leads (6 total)
  // ============================================================
  const [ale, mauricio, renata] = vendedorUsers;
  const leadSeeds = [
    { vendedor: ale, companyName: 'Constructora Monterrey', contactName: 'Luis Ramírez', contactEmail: 'luis@constmty.mx', industry: 'construccion', expectedAmount: 45000, status: 'contactado' },
    { vendedor: ale, companyName: 'Grupo Cementero del Norte', contactName: 'Marta Sáenz', contactEmail: 'marta@gcn.mx', industry: 'construccion', expectedAmount: 80000, status: 'propuesta' },
    { vendedor: mauricio, companyName: 'Química Industrial MX', contactName: 'Ricardo Ponce', contactEmail: 'r.ponce@quimx.mx', industry: 'quimica', expectedAmount: 60000, status: 'nuevo' },
    { vendedor: mauricio, companyName: 'Metalmecánica Saltillo', contactName: 'Ana Torres', contactEmail: 'ana@mmsaltillo.mx', industry: 'metalmecanica', expectedAmount: 35000, status: 'contactado' },
    { vendedor: renata, companyName: 'Minera Sonora Alto', contactName: 'Carlos Vega', contactEmail: 'cvega@minerasonora.mx', industry: 'mineria', expectedAmount: 120000, status: 'propuesta' },
    { vendedor: renata, companyName: 'Ergo Consulting Pyme', contactName: 'Diana Ríos', contactEmail: 'diana@ergopyme.mx', industry: 'construccion', expectedAmount: 25000, status: 'nuevo' },
  ];

  console.log('\nSales leads:');
  const existingLeadCount = await leads.count();
  if (existingLeadCount === 0) {
    for (const l of leadSeeds) {
      await leads.save(leads.create({
        vendedorId: l.vendedor.id,
        companyName: l.companyName,
        contactName: l.contactName,
        contactEmail: l.contactEmail,
        industry: l.industry,
        expectedAmount: l.expectedAmount,
        status: l.status as any,
      }));
      console.log(`  + lead: ${l.companyName} (${l.vendedor.email})`);
    }
  } else {
    console.log(`  ~ ${existingLeadCount} leads already exist`);
  }

  // ============================================================
  // Sales deals + commissions (4 total)
  // ============================================================
  const dealSeeds = [
    { vendedor: ale, buyerName: 'Constructora Monterrey', pkg: 'plus', amount: 45000, pct: 12 },
    { vendedor: ale, buyerName: 'Grupo Cementero del Norte', pkg: 'enterprise', amount: 90000, pct: 15 },
    { vendedor: mauricio, buyerName: 'Química Industrial MX', pkg: 'basico', amount: 22000, pct: 10 },
    { vendedor: renata, buyerName: 'Minera Sonora Alto', pkg: 'enterprise', amount: 110000, pct: 15 },
  ];

  console.log('\nSales deals:');
  const existingDealCount = await deals.count();
  if (existingDealCount === 0) {
    const now = new Date();
    const periodMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
    for (const d of dealSeeds) {
      const commissionAmount = Math.round((d.amount * d.pct) / 100 * 100) / 100;
      const deal = await deals.save(deals.create({
        vendedorId: d.vendedor.id,
        buyerName: d.buyerName,
        package: d.pkg as any,
        amount: d.amount,
        commissionPct: d.pct,
        commissionAmount,
        commissionRuleSnapshot: PACKAGE_TIER_RULE as any,
        closedAt: now,
      }));
      await commissions.save(commissions.create({
        vendedorId: d.vendedor.id,
        dealId: deal.id,
        amount: commissionAmount,
        status: 'pending',
        periodMonth,
      }));
      console.log(`  + deal ${d.buyerName} ${d.amount} MXN -> commission ${commissionAmount}`);
    }
  } else {
    console.log(`  ~ ${existingDealCount} deals already exist`);
  }

  // ============================================================
  // Training sessions (3)
  // ============================================================
  const [fernando, paola] = capUsers;
  const sessionSeeds = [
    { cap: fernando, title: 'NOM-009 Trabajos en altura', hours: 8, attendees: 22, status: 'delivered' },
    { cap: fernando, title: 'NOM-017 EPP - taller práctico', hours: 4, attendees: 15, status: 'scheduled' },
    { cap: paola, title: 'NOM-036 Ergonomía en oficinas', hours: 6, attendees: 30, status: 'delivered' },
  ];

  console.log('\nTraining sessions:');
  const existingSessionCount = await sessions.count();
  if (existingSessionCount === 0) {
    const now = new Date();
    for (const s of sessionSeeds) {
      await sessions.save(sessions.create({
        capacitadorId: s.cap.id,
        title: s.title,
        scheduledAt: now,
        deliveredAt: s.status === 'delivered' ? now : null,
        durationHours: s.hours,
        attendeeCount: s.attendees,
        location: 'CDMX',
        status: s.status as any,
      }));
      console.log(`  + session: ${s.title}`);
    }
  } else {
    console.log(`  ~ ${existingSessionCount} sessions already exist`);
  }

  // ============================================================
  // Appointments (2)
  // ============================================================
  console.log('\nAppointments:');
  const existingApptCount = await appointments.count();
  if (existingApptCount === 0) {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const inTwoDays = new Date(Date.now() + 48 * 3600 * 1000);
    await appointments.save(appointments.create({
      requesterKind: 'public',
      requesterContactName: 'Juan Pérez',
      requesterEmail: 'juan.perez@ejemplo.mx',
      requesterCompanyName: 'Prospect Corp',
      assignedUserId: ale.id,
      assignedRole: 'vendedor',
      purpose: 'demo',
      scheduledAt: tomorrow,
      status: 'requested',
    }));
    await appointments.save(appointments.create({
      requesterKind: 'client_admin',
      requesterContactName: 'María López',
      requesterEmail: 'client-admin@procheeck.mx',
      assignedUserId: fernando.id,
      assignedRole: 'capacitador',
      purpose: 'training',
      scheduledAt: inTwoDays,
      status: 'confirmed',
    }));
    console.log('  + 2 appointments');
  } else {
    console.log(`  ~ ${existingApptCount} appointments already exist`);
  }

  // ============================================================
  // Library documents (12)
  // ============================================================
  const libraryDocs = ds.getRepository(LibraryDocument);
  const CDN = 'https://cdn.procheck.mx/library';
  const UNSPLASH = (id: string, w = 800) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

  const librarySeeds: Array<{
    title: string;
    description: string;
    category: string;
    fileType: string;
    slug: string;
    nomReference: string | null;
    industry: string;
    isFree: boolean;
    price: number | null;
    thumbnail: string;
    sizeBytes: number;
  }> = [
    {
      title: 'Manual de trabajos en altura',
      description: 'Guía práctica para operar en altura conforme a la NOM-009-STPS-2011.',
      category: 'nom_009',
      fileType: 'pdf',
      slug: 'manual-trabajos-altura',
      nomReference: 'NOM-009-STPS-2011',
      industry: 'construccion',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1503387762-592deb58ef4e'),
      sizeBytes: 2_500_000,
    },
    {
      title: 'Guía práctica de selección de EPP',
      description: 'Selección, uso y mantenimiento del equipo de protección personal.',
      category: 'nom_017',
      fileType: 'pdf',
      slug: 'guia-epp',
      nomReference: 'NOM-017-STPS-2008',
      industry: 'general',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1581092160562-40aa08e78837'),
      sizeBytes: 1_800_000,
    },
    {
      title: 'Manual de prevención y combate de incendios',
      description: 'Condiciones y programas para la prevención y protección contra incendios.',
      category: 'nom_002',
      fileType: 'pdf',
      slug: 'manual-incendios',
      nomReference: 'NOM-002-STPS-2010',
      industry: 'general',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1544984243-ec57ea16fe25'),
      sizeBytes: 3_100_000,
    },
    {
      title: 'Guía de comisiones de seguridad e higiene',
      description: 'Integración y funcionamiento de la comisión de seguridad e higiene.',
      category: 'nom_019',
      fileType: 'pdf',
      slug: 'guia-comisiones',
      nomReference: 'NOM-019-STPS-2011',
      industry: 'general',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1587293852726-70cdb56c2866'),
      sizeBytes: 1_200_000,
    },
    {
      title: 'Manual de ergonomía y manejo de cargas',
      description: 'Prevención de trastornos musculoesqueléticos en el trabajo.',
      category: 'nom_036',
      fileType: 'pdf',
      slug: 'manual-ergonomia',
      nomReference: 'NOM-036-STPS-2018',
      industry: 'general',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1587293852726-70cdb56c2866'),
      sizeBytes: 2_900_000,
    },
    {
      title: 'Libro: Fundamentos de seguridad industrial',
      description: 'Introducción integral a la disciplina de la seguridad industrial en México.',
      category: 'general',
      fileType: 'epub',
      slug: 'libro-fundamentos-seguridad',
      nomReference: null,
      industry: 'general',
      isFree: false,
      price: 490,
      thumbnail: UNSPLASH('1518623489648-a173ef7824f3'),
      sizeBytes: 4_200_000,
    },
    {
      title: 'Libro: Auditoría STPS paso a paso',
      description: 'Metodología para preparar auditorías federales y estatales.',
      category: 'general',
      fileType: 'epub',
      slug: 'libro-auditoria-stps',
      nomReference: null,
      industry: 'general',
      isFree: false,
      price: 690,
      thumbnail: UNSPLASH('1504307651254-35680f356dfd'),
      sizeBytes: 3_600_000,
    },
    {
      title: 'Plantilla DC-3 (formato editable)',
      description: 'Constancia de competencias o habilidades laborales editable.',
      category: 'general',
      fileType: 'docx',
      slug: 'plantilla-dc3',
      nomReference: null,
      industry: 'general',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1580982327559-c1202864eb05'),
      sizeBytes: 620_000,
    },
    {
      title: 'Manual del capacitador STPS certificado',
      description: 'Guía para capacitadores externos con registro ante la STPS.',
      category: 'general',
      fileType: 'pdf',
      slug: 'manual-capacitador-stps',
      nomReference: null,
      industry: 'general',
      isFree: false,
      price: 1490,
      thumbnail: UNSPLASH('1584515933487-779824d29309'),
      sizeBytes: 5_800_000,
    },
    {
      title: 'Guía de bloqueo y etiquetado (LOTO)',
      description: 'Procedimientos de bloqueo y etiquetado para mantenimiento seguro.',
      category: 'general',
      fileType: 'pdf',
      slug: 'guia-loto',
      nomReference: null,
      industry: 'metalmecanica',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1473341304170-971dccb5ac1e'),
      sizeBytes: 2_100_000,
    },
    {
      title: 'Video: Rescate en altura (curso completo)',
      description: 'Video-curso completo de rescate en altura con procedimientos prácticos.',
      category: 'nom_009',
      fileType: 'mp4',
      slug: 'video-rescate-altura',
      nomReference: 'NOM-009-STPS-2011',
      industry: 'construccion',
      isFree: false,
      price: 890,
      thumbnail: UNSPLASH('1503387762-592deb58ef4e'),
      sizeBytes: 320_000_000,
    },
    {
      title: 'Manual de seguridad en minería subterránea',
      description: 'Prácticas seguras para operaciones mineras subterráneas.',
      category: 'general',
      fileType: 'pdf',
      slug: 'manual-mineria-subterranea',
      nomReference: 'NOM-023-STPS-2012',
      industry: 'mineria',
      isFree: true,
      price: null,
      thumbnail: UNSPLASH('1533162507191-d90c625b2640'),
      sizeBytes: 4_500_000,
    },
  ];

  console.log('\nLibrary documents:');
  const admin = await users.findOne({ where: { email: 'admin@procheeck.mx' } });
  for (const s of librarySeeds) {
    const existing = await libraryDocs.findOne({ where: { title: s.title } });
    if (existing) {
      console.log(`  ~ exists: ${s.title}`);
      continue;
    }
    await libraryDocs.save(
      libraryDocs.create({
        title: s.title,
        description: s.description,
        category: s.category as any,
        fileType: s.fileType,
        fileUrl: `${CDN}/${s.slug}.${s.fileType}`,
        fileSizeBytes: String(s.sizeBytes),
        thumbnailUrl: s.thumbnail,
        nomReference: s.nomReference,
        industry: s.industry,
        isFree: s.isFree,
        price: s.price != null ? String(s.price) : null,
        isPublished: true,
        createdBy: admin?.id ?? null,
      }),
    );
    console.log(`  + created: ${s.title}`);
  }

  await ds.destroy();
  console.log('\nDone. Default password: password123 (procheck.mx users: demo1234)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
