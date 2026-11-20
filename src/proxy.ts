import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs before each request: refreshes the Supabase auth cookie and guards pages.
// Logged out -> every page except /login redirects to /login.
// Logged in  -> /login redirects to /Home.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Skip until real Supabase keys are filled in .env.local
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // API routes do their own auth checks and return JSON, not redirects.
  if (path.startsWith("/api")) return response;

  if (!data.user && path !== "/login") {
    return redirectTo(request, response, `/login?next=${encodeURIComponent(path)}`);
  }
  if (data.user && path === "/login") {
    return redirectTo(request, response, "/Home");
  }
  return response;
}

// Redirect while keeping any refreshed auth cookies.
function redirectTo(request: NextRequest, response: NextResponse, path: string) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)"],
};
