import { RefreshingAuthProvider } from "@twurple/auth";

export async function getAuthProvider(refreshToken: string) {
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
  const host = process.env.HOST!;

  const authProvider = new RefreshingAuthProvider({
    clientId,
    clientSecret,
    redirectUri: `${host}/api/auth/callback/twitch`,
  });

  await authProvider.addUserForToken({
    refreshToken,
    expiresIn: 0,
    obtainmentTimestamp: Date.now(),
  });

  return authProvider;
}
