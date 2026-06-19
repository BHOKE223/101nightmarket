import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLAN_ID = import.meta.env.VITE_WHOP_PLAN_ID as string | undefined;
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CheckoutState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "redirecting"; purchase_url: string; checkout_id: string };

export default function BookingTest() {
  const [state, setState] = useState<CheckoutState>({ status: "idle" });

  async function handleBookBooth() {
    setState({ status: "loading" });
    try {
      const res = await fetch(`${BASE}/api/whop/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: PLAN_ID }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "Unknown error" });
        return;
      }
      setState({
        status: "redirecting",
        purchase_url: data.purchase_url,
        checkout_id: data.checkout_id,
      });
      // Redirect to Whop hosted checkout
      window.location.href = data.purchase_url;
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-3 border-amber-500 text-amber-400">
            Test Mode
          </Badge>
          <h1 className="text-3xl font-bold text-white">101 Night Market</h1>
          <p className="text-zinc-400 mt-1">Van Nuys — Booth Booking Test</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Standard Booth</CardTitle>
            <CardDescription className="text-zinc-400">
              Van Nuys Night Market · 1 night · Thu–Sun 5 pm–10 pm PT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Booth fee</span>
              <span className="text-2xl font-bold text-white">$85</span>
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Location</span>
              <span>A1–A20 or B1–B20</span>
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>Payment</span>
              <span>Whop · one-time</span>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              {state.status === "error" && (
                <div className="mb-3 rounded-md bg-red-950 border border-red-800 p-3 text-sm text-red-300">
                  {state.message}
                </div>
              )}

              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base h-12"
                onClick={handleBookBooth}
                disabled={state.status === "loading" || state.status === "redirecting"}
              >
                {state.status === "loading"
                  ? "Creating checkout…"
                  : state.status === "redirecting"
                    ? "Redirecting to Whop…"
                    : "Book Booth — Test"}
              </Button>

              <p className="text-center text-xs text-zinc-600 mt-3">
                Clicking redirects to Whop's hosted checkout. No charge until you complete payment.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Test checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              'Click "Book Booth" → redirected to Whop checkout',
              "Complete payment → redirect back to /booking/success",
              "Webhook fires → server logs confirm payment",
              "GET /api/whop/verify?checkout_id=… returns verified: true",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-zinc-500">
                <span className="mt-0.5 h-4 w-4 rounded border border-zinc-700 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
