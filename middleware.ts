import { createServerClient, type CookieOptions, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that do not require a session (public).
const PUBLIC_ROUTES = ["/login"];

// Routes that should redirect authenticated users away (to dashboard).
const AUTHED_ROUTES = ["/login"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request: req });

  let res = NextResponse.next({ request: req });
  const refreshedCookies = new Map<string, { name: string; value: string; options: CookieOptions }>();
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            refreshedCookies.set(name, { name, value, options });
          });
          res = NextResponse.next({ request: req });
          refreshedCookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;

  // Authenticated user on login -> dashboard.
  if (user && AUTHED_ROUTES.includes(pathname)) {
    res = NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user on a protected route -> login.
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    res = NextResponse.redirect(new URL("/login", req.url));
  }

  refreshedCookies.forEach(({ name, value, options }) => {
    res.cookies.set(name, value, options);
  });

  return res;
}
