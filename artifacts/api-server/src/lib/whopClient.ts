import Whop from "@whop/sdk";

let client: Whop | null = null;

export function getWhopClient(): Whop {
  if (!client) {
    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      throw new Error(
        "WHOP_API_KEY is not set. Add it as a secret in the Replit Secrets tab.",
      );
    }
    client = new Whop({ apiKey });
  }
  return client;
}
