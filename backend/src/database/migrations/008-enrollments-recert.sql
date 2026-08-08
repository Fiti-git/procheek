-- Sprint F: recertification support for enrollments.
-- Allow multiple enrollment rows per (user, course) so a recertification pass is
-- a distinct row linked back to the previous one via recertification_of.
-- All statements idempotent — safe to re-run.

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS recertification_of UUID
    REFERENCES enrollments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_enrollments_recert
  ON enrollments(recertification_of)
  WHERE recertification_of IS NOT NULL;

-- Drop the historical UNIQUE (user_id, course_id) so recerts can coexist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'enrollments_user_id_course_id_key'
       AND conrelid = 'enrollments'::regclass
  ) THEN
    ALTER TABLE enrollments DROP CONSTRAINT enrollments_user_id_course_id_key;
  END IF;
END $$;

-- Partial unique constraint: only one ACTIVE enrollment per (user, course).
-- Completed/expired/failed/cancelled rows can accumulate freely.
CREATE UNIQUE INDEX IF NOT EXISTS uq_enrollments_active_user_course
  ON enrollments(user_id, course_id)
  WHERE status = 'active';
