import { NextResponse } from "next/server";
import { NextAuthConfig } from "next-auth";

export const authConfig={
    providers: [],
    callbacks: {authorized({ request, auth }) {
      //Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      //Get pathname from the request url object
      const { pathname } = request.nextUrl;

      //Check if user is not authenticated and accessing a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      //Check for session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        //Generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();
        //Clone request headers
        const newRequestHeaders = new Headers(request.headers);
        //Create new Response and add new headers.
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        // set new generated sessionCartId in the response cookies.
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },

    }
} satisfies NextAuthConfig