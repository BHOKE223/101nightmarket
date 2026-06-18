import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type BoothPrice = {
  id: number;
  location: string;
  boothType: string;
  label: string;
  price: number;
  whopPlanId: string;
  active: boolean;
};

const LOCATION_LABELS: Record<string, string> = {
  van_nuys: "Van Nuys",
  hollywood: "Hollywood",
};

const TYPE_LABELS: Record<string, string> = {
  standard: "Standard Booth",
  endcap: "Endcap Booth",
};

export default function AdminPricing() {
  const [prices, setPrices] = useState<BoothPrice[]>([]);
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/admin/pricing`)
      .then((r) => r.json())
      .then((d) => {
        setPrices(d.pricing ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setLoadError(e.message);
        setLoading(false);
      });
  }, []);

  function startEdit(p: BoothPrice) {
    setEditing((prev) => ({ ...prev, [p.id]: String(p.price) }));
    setErrors((prev) => ({ ...prev, [p.id]: "" }));
    setSuccess((prev) => ({ ...prev, [p.id]: false }));
  }

  function cancelEdit(id: number) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function savePrice(p: BoothPrice) {
    const raw = editing[p.id];
    const newPrice = Math.round(parseFloat(raw));
    if (!raw || isNaN(newPrice) || newPrice < 1) {
      setErrors((prev) => ({ ...prev, [p.id]: "Enter a valid price above $0" }));
      return;
    }
    if (newPrice === p.price) {
      cancelEdit(p.id);
      return;
    }

    setSaving((prev) => ({ ...prev, [p.id]: true }));
    setErrors((prev) => ({ ...prev, [p.id]: "" }));

    try {
      const res = await fetch(`${BASE}/api/admin/pricing/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update price");

      setPrices((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, price: newPrice, whopPlanId: json.whopPlanId ?? item.whopPlanId } : item
        )
      );
      setSuccess((prev) => ({ ...prev, [p.id]: true }));
      cancelEdit(p.id);
      setTimeout(() => setSuccess((prev) => ({ ...prev, [p.id]: false })), 2500);
    } catch (e) {
      setErrors((prev) => ({ ...prev, [p.id]: e instanceof Error ? e.message : "Unknown error" }));
    } finally {
      setSaving((prev) => ({ ...prev, [p.id]: false }));
    }
  }

  const grouped = prices.reduce<Record<string, BoothPrice[]>>((acc, p) => {
    acc[p.location] = acc[p.location] ?? [];
    acc[p.location].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <Badge variant="outline" className="mb-2 border-amber-500 text-amber-400">Admin</Badge>
          <h1 className="text-3xl font-bold">Booth Pricing</h1>
          <p className="text-zinc-400 mt-1">
            Update prices below — changes take effect immediately for new bookings.
          </p>
        </div>

        {loading && (
          <p className="text-zinc-400">Loading pricing…</p>
        )}

        {loadError && (
          <p className="text-red-400">Failed to load pricing: {loadError}</p>
        )}

        {Object.entries(grouped).map(([location, items]) => (
          <Card key={location} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">
                {LOCATION_LABELS[location] ?? location}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((p) => {
                const isEditing = p.id in editing;
                const isSaving = saving[p.id];
                return (
                  <div key={p.id} className="flex items-center gap-4 py-3 border-b border-zinc-800 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {TYPE_LABELS[p.boothType] ?? p.label}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{p.whopPlanId}</p>
                    </div>

                    {!isEditing ? (
                      <div className="flex items-center gap-3">
                        {success[p.id] && (
                          <span className="text-xs text-emerald-400">✓ Saved</span>
                        )}
                        <span className="text-xl font-bold text-white">${p.price}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={editing[p.id]}
                            onChange={(e) =>
                              setEditing((prev) => ({ ...prev, [p.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") savePrice(p);
                              if (e.key === "Escape") cancelEdit(p.id);
                            }}
                            className="bg-zinc-800 border-zinc-700 text-white pl-7 w-28"
                            autoFocus
                          />
                        </div>
                        {errors[p.id] && (
                          <span className="text-xs text-red-400">{errors[p.id]}</span>
                        )}
                        <Button
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                          onClick={() => savePrice(p)}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-500 hover:text-zinc-300"
                          onClick={() => cancelEdit(p.id)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">
          <p className="font-medium text-zinc-400 mb-1">How pricing works</p>
          <p>
            When you update a price, the system automatically creates a new plan on Whop at the new amount.
            All new vendor bookings will use the updated price immediately.
            Existing paid bookings are not affected.
          </p>
        </div>
      </div>
    </div>
  );
}
