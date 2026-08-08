-- Sprint D: seed 6 notifications per user based on role.
-- Idempotent: skips if user already has any notifications.

DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT id, role_code AS role FROM users WHERE is_active = true
  LOOP
    IF EXISTS (SELECT 1 FROM notifications WHERE user_id = u.id) THEN
      CONTINUE;
    END IF;

    -- Common: certificate expiring reminder (all users)
    INSERT INTO notifications (user_id, kind, title, body, link, created_at)
    VALUES (u.id, 'certificate_expiring',
            'Certificado por vencer en 15 días',
            'Uno de tus certificados vence pronto. Renueva antes de la fecha límite.',
            '/dashboard/certificates',
            NOW() - INTERVAL '2 hours');

    IF u.role = 'capacitador' THEN
      INSERT INTO notifications (user_id, kind, title, body, link, created_at) VALUES
      (u.id, 'enrolled', 'Nueva sesión programada',
       'Se agendó una sesión de capacitación NOM-035 para el próximo lunes.',
       '/dashboard/trainer/sessions', NOW() - INTERVAL '1 day'),
      (u.id, 'enrolled', 'Recordatorio de sesión',
       'Tu sesión de mañana tiene 24 asistentes confirmados.',
       '/dashboard/trainer/sessions', NOW() - INTERVAL '3 hours'),
      (u.id, 'invite', 'Nueva cita agendada',
       'Se agendó una cita de demo para el viernes a las 10:00.',
       '/dashboard/trainer/appointments', NOW() - INTERVAL '6 hours'),
      (u.id, 'enrolled', 'Evaluación pendiente',
       'Cuatro asistentes están pendientes de evaluación en la sesión NOM-009.',
       '/dashboard/trainer', NOW() - INTERVAL '2 days'),
      (u.id, 'enrolled', 'Nuevo material disponible',
       'Se actualizó el material de NOM-035 con nuevos ejercicios prácticos.',
       '/dashboard/library', NOW() - INTERVAL '4 days');

    ELSIF u.role = 'vendedor' THEN
      INSERT INTO notifications (user_id, kind, title, body, link, created_at) VALUES
      (u.id, 'payment_paid', 'Comisión aprobada',
       'Tu comisión de $12,850 MXN fue aprobada y será depositada esta semana.',
       '/dashboard/sales/commissions', NOW() - INTERVAL '1 day'),
      (u.id, 'invite', 'Nuevo lead asignado',
       'Grupo Constructor del Norte solicitó información de paquetes.',
       '/dashboard/sales/leads', NOW() - INTERVAL '5 hours'),
      (u.id, 'invite', 'Nueva cita agendada',
       'Reunión con Prospecto Industrial mañana a las 15:00.',
       '/dashboard/sales/appointments', NOW() - INTERVAL '8 hours'),
      (u.id, 'enrolled', 'Meta mensual al 78%',
       'Vas al 78% de tu meta de ventas. Restan 12 días.',
       '/dashboard/sales', NOW() - INTERVAL '3 days'),
      (u.id, 'payment_paid', 'Venta cerrada',
       'Se cerró venta con Constructora Demo por $54,200 MXN.',
       '/dashboard/sales/deals', NOW() - INTERVAL '4 days');

    ELSIF u.role IN ('client', 'client_admin') THEN
      INSERT INTO notifications (user_id, kind, title, body, link, created_at) VALUES
      (u.id, 'invite', 'Nuevo miembro invitado a tu equipo',
       'Se envió una invitación a nuevo.empleado@empresa.mx.',
       '/dashboard/team', NOW() - INTERVAL '1 day'),
      (u.id, 'certificate_issued', 'Certificado emitido a un empleado',
       'Se emitió un certificado NOM-009 a Juan Pérez.',
       '/dashboard/certificates', NOW() - INTERVAL '2 days'),
      (u.id, 'enrolled', 'Curso asignado en lote',
       'Se asignó NOM-017 a 12 empleados.',
       '/dashboard/courses', NOW() - INTERVAL '3 days'),
      (u.id, 'quiz_passed', 'Un empleado aprobó su evaluación',
       'María López aprobó la evaluación de NOM-035 con 94/100.',
       '/dashboard/team', NOW() - INTERVAL '4 days'),
      (u.id, 'certificate_expiring', 'Vencimientos próximos',
       '3 certificados de tu equipo vencen en los próximos 30 días.',
       '/dashboard/reports', NOW() - INTERVAL '5 days');

    ELSE
      -- employee / subcontractor / principal_admin
      INSERT INTO notifications (user_id, kind, title, body, link, created_at) VALUES
      (u.id, 'enrolled', 'Curso completado',
       'Completaste NOM-017 EPP. Tu certificado se generó automáticamente.',
       '/dashboard/certificates', NOW() - INTERVAL '1 day'),
      (u.id, 'enrolled', 'Nuevo curso asignado',
       'Tu administrador te asignó NOM-035 Factores psicosociales.',
       '/dashboard/courses', NOW() - INTERVAL '2 days'),
      (u.id, 'quiz_passed', 'Evaluación aprobada',
       'Aprobaste la evaluación con 88/100.',
       '/dashboard/courses', NOW() - INTERVAL '3 days'),
      (u.id, 'certificate_issued', 'Certificado emitido',
       'Tu certificado NOM-009 está listo para descargar.',
       '/dashboard/certificates', NOW() - INTERVAL '4 days'),
      (u.id, 'invite', 'Bienvenido a PROCHECK Safety',
       'Tu cuenta se activó correctamente. Explora tus cursos asignados.',
       '/dashboard', NOW() - INTERVAL '7 days');
    END IF;
  END LOOP;
END $$;

SELECT COUNT(*) AS total_notifications FROM notifications;
