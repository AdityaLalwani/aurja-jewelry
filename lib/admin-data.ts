import "server-only";

import { queryNeon } from "@/lib/neon-db";
import {
  getCategories,
  listProducts,
  listStoreRecords,
} from "@/lib/store-db";

export async function getAdminDashboard() {
  const [stats] = await queryNeon<{
    products: string;
    categories: string;
    customers: string;
    orders: string;
    discounts: string;
    low_stock: string;
  }>(
    `SELECT
       (SELECT count(*)::text FROM store_products) AS products,
       (SELECT count(*)::text FROM store_categories) AS categories,
       (SELECT count(*)::text FROM store_customers) AS customers,
       (SELECT count(*)::text FROM store_orders) AS orders,
       (SELECT count(*)::text FROM store_discounts
        WHERE COALESCE(payload ->> 'active', 'true') NOT IN ('false', '0')) AS discounts,
       (SELECT count(*)::text FROM store_products
        WHERE COALESCE(payload ->> 'active', 'true') NOT IN ('false', '0')
          AND CASE WHEN payload ->> 'stock_level' ~ '^-?[0-9]+$'
                   THEN (payload ->> 'stock_level')::int
                   ELSE 0
              END <= 5) AS low_stock`,
  );

  return {
    products: Number(stats?.products ?? 0),
    categories: Number(stats?.categories ?? 0),
    customers: Number(stats?.customers ?? 0),
    orders: Number(stats?.orders ?? 0),
    discounts: Number(stats?.discounts ?? 0),
    lowStock: Number(stats?.low_stock ?? 0),
  };
}

export async function getAdminProducts(search = "") {
  return listProducts(search, 200);
}

export async function getAdminCategories() {
  return getCategories();
}

export async function getAdminCustomers(search = "") {
  const term = search.trim();
  const rows = await queryNeon<{
    store_id: string;
    payload: Record<string, unknown>;
    cart: unknown[];
    wishlist: string[];
    orders: Array<Record<string, unknown>>;
  }>(
    `SELECT c.store_id, c.payload,
            COALESCE(a.cart, '[]'::jsonb) AS cart,
            COALESCE(a.wishlist, '[]'::jsonb) AS wishlist,
            COALESCE(o.orders, '[]'::jsonb) AS orders
     FROM store_customers c
     LEFT JOIN store_customer_activity a ON a.customer_id = c.store_id
     LEFT JOIN LATERAL (
       SELECT jsonb_agg(
         jsonb_build_object(
           'id', store_id,
           'number', COALESCE(payload ->> 'number', payload ->> 'order_number'),
           'status', payload ->> 'status',
           'created_at', COALESCE(payload ->> 'date_created', payload ->> 'created_at'),
           'total', COALESCE(payload ->> 'grand_total', payload ->> 'total'),
           'type', payload ->> 'type'
         ) ORDER BY imported_at DESC
       ) AS orders
       FROM store_orders
       WHERE lower(payload ->> 'email') = lower(c.payload ->> 'email')
          OR payload ->> 'account_id' = c.store_id
     ) o ON true
     WHERE $1 = '' OR c.payload::text ILIKE $2
     ORDER BY c.imported_at DESC
     LIMIT 200`,
    [term, `%${term}%`],
  );
  return rows.map(({ store_id, payload, cart, wishlist, orders }) => ({
    id: store_id,
    payload,
    cart,
    wishlist,
    orders,
  }));
}

export async function getAdminOrders(search = "") {
  return listStoreRecords("store_orders", search, 200);
}

export async function getAdminDiscounts(search = "") {
  return listStoreRecords("store_discounts", search, 200);
}

