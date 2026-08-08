import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private from = 'PROCHEECK <onboarding@resend.dev>';
  private appUrl = 'http://localhost:3000';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.from = this.config.get<string>('MAIL_FROM', this.from);
    this.appUrl = this.config.get<string>('APP_URL', this.appUrl);

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured — emails will only be logged (dev mode).');
      return;
    }
    this.resend = new Resend(apiKey);
  }

  private async send({ to, subject, html, text, attachments }: SendArgs) {
    if (!this.resend) {
      this.logger.log(`[DEV MAIL] To: ${to}`);
      this.logger.log(`[DEV MAIL] Subject: ${subject}`);
      this.logger.log(`[DEV MAIL] Text: ${text.slice(0, 400)}`);
      if (attachments?.length) {
        this.logger.log(`[DEV MAIL] Attachments: ${attachments.map((a) => a.filename).join(', ')}`);
      }
      return;
    }
    const res = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
      text,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
    if (res.error) {
      this.logger.error(`Resend error: ${JSON.stringify(res.error)}`);
      throw new Error(res.error.message || 'Failed to send email');
    }
    this.logger.log(`Email sent to ${to} (id: ${res.data?.id})`);
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const subject = 'Restablecer contraseña — PROCHEECK';
    const text =
      `Hola,\n\nRecibimos una solicitud para restablecer tu contraseña.\n\n` +
      `Abre este enlace para elegir una nueva (válido por 1 hora):\n\n${resetUrl}\n\n` +
      `Si no solicitaste este correo, ignóralo. Tu contraseña actual seguirá funcionando.\n\n— PROCHEECK`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#0f172a">
        <h2 style="color:#1e3a8a">PROCHEECK</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:10px 16px;background:#1e3a8a;color:#fff;text-decoration:none;border-radius:6px">
            Restablecer contraseña
          </a>
        </p>
        <p style="font-size:12px;color:#64748b">El enlace expira en 1 hora. Si no solicitaste este correo, ignóralo.</p>
      </div>`;
    await this.send({ to, subject, html, text });
  }

  async sendInvite(args: {
    to: string;
    firstName: string;
    tempPassword: string;
    invitedByName?: string;
    companyName?: string;
  }) {
    const loginUrl = `${this.appUrl}/login`;
    const subject = 'Bienvenido a PROCHEECK — tu cuenta está lista';
    const text =
      `Hola ${args.firstName},\n\n` +
      `${args.invitedByName ? `${args.invitedByName} te ha` : 'Te hemos'} invitado a PROCHEECK` +
      `${args.companyName ? ` en ${args.companyName}` : ''}.\n\n` +
      `Tu correo: ${args.to}\n` +
      `Contraseña temporal: ${args.tempPassword}\n\n` +
      `Inicia sesión aquí: ${loginUrl}\n\n` +
      `Por seguridad, se te pedirá cambiar tu contraseña al ingresar por primera vez.\n\n— PROCHEECK`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#0f172a">
        <h2 style="color:#1e3a8a">PROCHEECK</h2>
        <p>Hola <strong>${args.firstName}</strong>,</p>
        <p>${args.invitedByName ? `${args.invitedByName} te ha` : 'Te hemos'} invitado a PROCHEECK${args.companyName ? ` en <strong>${args.companyName}</strong>` : ''}.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0;font-family:ui-monospace,monospace;font-size:14px">
          <div><span style="color:#64748b">Correo:</span> ${args.to}</div>
          <div><span style="color:#64748b">Contraseña temporal:</span> <strong>${args.tempPassword}</strong></div>
        </div>
        <p>
          <a href="${loginUrl}"
             style="display:inline-block;padding:10px 16px;background:#1e3a8a;color:#fff;text-decoration:none;border-radius:6px">
            Iniciar sesión
          </a>
        </p>
        <p style="font-size:12px;color:#64748b">
          Por seguridad se te pedirá cambiar la contraseña al ingresar por primera vez.
        </p>
      </div>`;
    await this.send({ to: args.to, subject, html, text });
  }

  async sendCertificateExpiring(args: {
    to: string;
    firstName: string;
    courseTitle: string;
    code: string;
    expiresAt: Date;
    daysLeft: number;
  }) {
    const subject = `Tu certificado vence en ${args.daysLeft} día${args.daysLeft === 1 ? '' : 's'} — ${args.courseTitle}`;
    const expiresStr = args.expiresAt.toISOString().slice(0, 10);
    const dashUrl = `${this.appUrl}/dashboard/employee/certificates`;
    const text =
      `Hola ${args.firstName},\n\n` +
      `Tu certificado del curso "${args.courseTitle}" (${args.code}) vence el ${expiresStr} ` +
      `(${args.daysLeft} día${args.daysLeft === 1 ? '' : 's'}).\n\n` +
      `Para mantener tu cumplimiento NOM/STPS, inicia la recertificación desde tu panel:\n${dashUrl}\n\n— PROCHEECK`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#0f172a">
        <h2 style="color:#1e3a8a">PROCHEECK</h2>
        <p>Hola <strong>${args.firstName}</strong>,</p>
        <p>Tu certificado del curso <strong>${args.courseTitle}</strong> vence en <strong>${args.daysLeft} día${args.daysLeft === 1 ? '' : 's'}</strong> (${expiresStr}).</p>
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;border-radius:4px">
          <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Código</div>
          <div style="font-family:ui-monospace,monospace;font-size:16px;margin-top:4px"><strong>${args.code}</strong></div>
        </div>
        <p>Para mantener tu cumplimiento NOM/STPS, inicia la recertificación:</p>
        <p>
          <a href="${dashUrl}"
             style="display:inline-block;padding:10px 16px;background:#1e3a8a;color:#fff;text-decoration:none;border-radius:6px">
            Ir a mis certificados
          </a>
        </p>
      </div>`;
    await this.send({ to: args.to, subject, html, text });
  }

  async sendCertificateIssued(args: {
    to: string;
    firstName: string;
    courseTitle: string;
    code: string;
    pdf: Buffer;
  }) {
    const verifyUrl = `${this.appUrl}/certificate-lookup`;
    const subject = `Certificado emitido — ${args.courseTitle}`;
    const text =
      `Hola ${args.firstName},\n\n` +
      `¡Felicidades! Has aprobado el curso "${args.courseTitle}".\n\n` +
      `Tu certificado está adjunto en PDF.\n` +
      `Código de verificación: ${args.code}\n` +
      `Cualquiera puede verificar su autenticidad en: ${verifyUrl}\n\n— PROCHEECK`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#0f172a">
        <h2 style="color:#1e3a8a">PROCHEECK</h2>
        <p>Hola <strong>${args.firstName}</strong>,</p>
        <p>¡Felicidades! Has aprobado el curso <strong>${args.courseTitle}</strong>.</p>
        <p>Tu certificado está adjunto a este correo en formato PDF.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0">
          <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Código de verificación</div>
          <div style="font-family:ui-monospace,monospace;font-size:16px;margin-top:4px"><strong>${args.code}</strong></div>
        </div>
        <p>
          <a href="${verifyUrl}"
             style="display:inline-block;padding:10px 16px;background:#1e3a8a;color:#fff;text-decoration:none;border-radius:6px">
            Verificar certificado
          </a>
        </p>
      </div>`;
    await this.send({
      to: args.to,
      subject,
      html,
      text,
      attachments: [{ filename: `certificate-${args.code}.pdf`, content: args.pdf }],
    });
  }
}
