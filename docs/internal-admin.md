# Internal admin dashboard

The internal dashboard is available at `/internal` and is protected by Better Auth roles:

- `user`: customer account without internal access.
- `admin`: internal operator.
- `superuser`: can manage internal roles and other privileged users.

Deploy the Prisma migration before using the dashboard:

```bash
bun run prisma:migrate
```

The first superuser must be assigned manually after the admin schema migration:

```sql
UPDATE User
SET role = 'superuser'
WHERE lower(email) = lower('<admin-email>');
```

Sign out and sign back in after changing the role so the Better Auth session reflects it.

Manual free Pro access is represented by `Organization.plan = 'PRO'` and
`Organization.status = 'SPONSORED'`. Paid Pro subscriptions remain owned by Stripe;
the internal dashboard must not overwrite an active Stripe subscription.
