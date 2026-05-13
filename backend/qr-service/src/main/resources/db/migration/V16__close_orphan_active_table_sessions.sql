UPDATE table_sessions
SET status = 'CLOSED_BY_ADMIN',
    closed_at = COALESCE(closed_at, GETDATE()),
    close_reason = 'CLOSED_ORPHAN_SESSION_WITHOUT_GUESTS',
    last_activity_at = GETDATE(),
    updated_at = GETDATE()
WHERE status IN ('ACTIVE', 'ORDERED', 'PAYMENT_PENDING')
  AND NOT EXISTS (
      SELECT 1
      FROM guest_sessions
      WHERE guest_sessions.table_session_id = table_sessions.id
  );
