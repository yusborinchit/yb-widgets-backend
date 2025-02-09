import { RefreshingAuthProvider } from "@twurple/auth";

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;

export function getAuthProvider(refreshToken: string) {
  const authProvider = new RefreshingAuthProvider({
    clientId,
    clientSecret,
    redirectUri: "http://localhost:3000/api/auth/callback/twitch",
  });

  authProvider.addUserForToken({
    refreshToken,
    expiresIn: 0,
    obtainmentTimestamp: Date.now(),
  });

  return authProvider;
}
