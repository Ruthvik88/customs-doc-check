import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Routes that do not require a session (public).
const PUBLIC_ROUTES = ["/login"];

// Routes that should redirect authenticated users away (to dashboard).
const AUTHED_ROUTES = ["/login"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export async function middleware(req: Request) {
  const res = NextResponse.next();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = new URL(req.url).pathname;

  // If Supabase env is missing, let requests through (dev without config).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res;
  }

  // Authenticated user on login -> dashboard.
  if (user && AUTHED_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user on a protected route -> login.
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}
