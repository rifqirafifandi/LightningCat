#!/bin/bash

psql -U lightningcatuser -d lightningcat <<EOF

TRUNCATE TABLE listings, bookings, wallet, transactions RESTART IDENTITY CASCADE;

INSERT INTO wallet (user_id, currency, status)
SELECT id, 'SGD', 'active' 
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM wallet w WHERE w.user_id = users.id
);

EOF
