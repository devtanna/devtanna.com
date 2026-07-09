import { TwitterApi } from "twitter-api-v2";

/**
 * Returns an X (Twitter) client, or `null` when the OAuth 1.0a creds aren't
 * configured. Callers should treat null as "don't post" (e.g. local dev dry-runs
 * the tweet to the console instead of hitting the API). Server-only.
 */
export function getXClient() {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } =
    process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET)
    return null;
  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_SECRET,
  });
}
