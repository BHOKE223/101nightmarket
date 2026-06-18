import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type VerifyState =
  | { status: "checking" }
  | { status: "verified" }
  | { status: "unverified"; message: string }
  | { status: "error"; message: string };

export default function BookingSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const checkoutId = params.get("checkout_id") ?? params.get("checkoutId");

  const [verify, setVerify] = useState<VerifyState>({ status: "checking" });

  useEffect(() => {
    if (!checkoutId) {
      setVerify({ status: "error", message: "No checkout_id in URL — cannot verify server-side." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${BASE}/api/whop/verify?checkout_id=${encodeURIComponent(checkoutId)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          setVerify({ status: "error", message: data.error ?? "Verify request failed" });
          return;
        }
        setVerify(data.verified ? { status: "verified" } : { status: "unverified", message: "Payment not yet confirmed by Whop. This may take a few seconds — refresh to retry." });
      } catch (err) {
        setVerify({ status: "error", message: err instanceof Error ? err.message : "Network error" });
      }
    })();
  }, [checkoutId]);

  const icon =
    verify.status === "verified"
      ? "✅"
      : verify.status === "checking"
        ? "⏳"
        : "❌";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-3 border-amber-500 text-amber-400">
            Test Mode
          </Badge>
          <h1 className="text-3xl font-bold text-white">101 Night Market</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2">{icon}</div>
            <CardTitle className="text-white text-xl">
              {verify.status === "verified"
                ? "Booking Confirmed!"
                : verify.status === "checking"
                  ? "Verifying payment…"
                  : "Verification failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {verify.status === "verified" && (
              <div className="rounded-md bg-green-950 border border-green-800 p-3 text-green-300">
                Server-side verification passed. Whop confirmed this payment is valid.
              </div>
            )}
            {(verify.status === "unverified" || verify.status === "error") && (
              <div className="rounded-md bg-red-950 border border-red-800 p-3 text-red-300">
                {(verify as any).message}
              </div>
            )}

            <div className="space-y-1 text-zinc-500">
              <div className="flex justify-between">
                <span>Checkout ID</span>
                <span className="font-mono text-zinc-400 truncate max-w-[200px]">
                  {checkoutId ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Server verified</span>
                <span className={verify.status === "verified" ? "text-green-400" : "text-zinc-400"}>
                  {verify.status === "checking" ? "checking…" : verify.status === "verified" ? "yes" : "no"}
                </span>
              </div>
            </div>

            <Link href="/booking/test">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                ← Back to booking test
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
