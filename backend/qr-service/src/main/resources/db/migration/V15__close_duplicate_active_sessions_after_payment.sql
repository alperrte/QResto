UPDATE active_session
SET status = 'COMPLETED',
    closed_at = COALESCE(active_session.closed_at, paid_session.closed_at, GETDATE()),
    close_reason = 'PAYMENT_COMPLETED',
    last_activity_at = COALESCE(paid_session.closed_at, GETDATE()),
    updated_at = GETDATE()
FROM table_sessions active_session
         INNER JOIN table_sessions paid_session
                    ON paid_session.table_id = active_session.table_id
                        AND paid_session.id <> active_session.id
                        AND paid_session.status = 'COMPLETED'
                        AND paid_session.close_reason = 'PAYMENT_COMPLETED'
                        AND paid_session.closed_at IS NOT NULL
                        AND paid_session.closed_at >= active_session.created_at
WHERE active_session.status IN ('ACTIVE', 'ORDERED', 'PAYMENT_PENDING');

UPDATE guest_session
SET status = 'CLOSED',
    closed_at = COALESCE(guest_session.closed_at, table_session.closed_at, GETDATE()),
    close_reason = 'PAYMENT_COMPLETED',
    last_activity_at = COALESCE(table_session.closed_at, GETDATE()),
    updated_at = GETDATE()
FROM guest_sessions guest_session
         INNER JOIN table_sessions table_session
                    ON table_session.id = guest_session.table_session_id
WHERE guest_session.status = 'ACTIVE'
  AND table_session.status = 'COMPLETED'
  AND table_session.close_reason = 'PAYMENT_COMPLETED'
  AND table_session.closed_at IS NOT NULL;
