-- =============================================================================
-- Remove the backfill that assigned all published modules to the Staff role.
-- After this, staff see only modules that admin has explicitly assigned
-- (to the Staff role or to specific employees).
-- =============================================================================

DELETE FROM public.module_role_assignments
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'staff' LIMIT 1);
