-- =============================
-- RBAC hardening + real role switching
-- =============================

-- 1) Ensure ONE role per user (dedupe + unique index)
WITH ranked AS (
  SELECT
    id,
    user_id,
    role,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE role
          WHEN 'admin' THEN 4
          WHEN 'restaurant' THEN 3
          WHEN 'driver' THEN 2
          WHEN 'customer' THEN 1
          ELSE 0
        END DESC
    ) AS rn
  FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked r
WHERE ur.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_per_user
  ON public.user_roles (user_id);

-- 2) Lock down direct writes to user_roles (prevent privilege escalation)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Keep read access (needed by the app + has_role checks)
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3) Create SECURITY DEFINER functions to safely set/ensure roles
--    (role switching should happen through these functions, not via direct UPDATE)
CREATE OR REPLACE FUNCTION public.ensure_my_role()
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.app_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO r
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF r IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'customer'::public.app_role)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT role INTO r
    FROM public.user_roles
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_my_role(_role public.app_role)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- prevent self-promotion to admin
  IF _role = 'admin'::public.app_role AND NOT has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Not allowed to set admin role';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;

  RETURN _role;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_my_role(public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_role(public.app_role) TO authenticated;

-- 4) Restaurants: allow restaurant owners to create their own restaurant
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can create restaurants" ON public.restaurants;

CREATE POLICY "Restaurant owners and admins can create restaurants"
ON public.restaurants
FOR INSERT
WITH CHECK (
  (owner_id = auth.uid() AND has_role(auth.uid(), 'restaurant'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 5) Orders: only customers can place orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND has_role(auth.uid(), 'customer'::app_role)
);

-- 6) Reviews: only customers, and only after a delivered order
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

CREATE POLICY "Customers can create reviews after delivery"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND has_role(auth.uid(), 'customer'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.user_id = auth.uid()
      AND o.restaurant_id = reviews.restaurant_id
      AND o.status = 'delivered'::order_status
  )
);

-- 7) Drivers: only users with driver role can create their driver profile
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can create drivers" ON public.drivers;

CREATE POLICY "Drivers (and admins) can create driver profiles"
ON public.drivers
FOR INSERT
WITH CHECK (
  (user_id = auth.uid() AND has_role(auth.uid(), 'driver'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 8) Expand order statuses to support READY / PICKED UP (optional but required for true flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.order_status'::regtype
      AND enumlabel = 'ready_for_pickup'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'ready_for_pickup';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.order_status'::regtype
      AND enumlabel = 'picked_up'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'picked_up';
  END IF;
END $$;
