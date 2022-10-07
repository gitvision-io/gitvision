import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { sign, verify } from "jsonwebtoken";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // ...add more providers here
  ],
  jwt: {
    encode(params: JWTEncodeParams): Promise<string> {
      // return a custom encoded JWT string
      console.log(params);
      return Promise.resolve(sign(params.token!, process.env.NEXTAUTH_SECRET!));
    },
    decode(params: JWTDecodeParams): Promise<JWT | null> {
      // return a `JWT` object, or `null` if decoding failed
      const jwt = verify(params.token!, process.env.NEXTAUTH_SECRET!) as any;
      console.log(jwt);
      return Promise.resolve({
        name: jwt.name,
        email: jwt.email,
        picture: jwt.picture,
        sub: jwt.sub,
        state: jwt.state,
        iat: jwt.iat
      } as JWT);
    },
  },
};
export default NextAuth(authOptions);
