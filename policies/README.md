All RLS policies live here as migration-friendly SQL.

- Default deny; allow by explicit predicate.
- Single-user: scope by auth.uid() = user_id.
- Multi-tenant: scope by membership (user_id, tenant_id). 