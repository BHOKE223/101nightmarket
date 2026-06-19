import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Payment = {
  id: string;
  status: string;
  final_amount: number;
  fee_amount: number;
  created_at: string;
  user?: { email?: string; name?: string };
};

type Summary = {
  totalGross: number;
  totalFees: number;
  devFeeTotal: number;
  totalRefunded: number;
  netRevenue: number;
  paymentCount: number;
  refundCount: number;
};

type ReportData = { summary: Summary; payments: Payment[]; refunds: any[] };

type RefundModal = { open: false } | { open: true; payment: Payment };

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState<RefundModal>({ open: false });
  const [refundAmount, setRefundAmount] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState(false);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/admin/reports?from=${from}&to=${to}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load report");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    window.open(`${BASE}/api/admin/reports/export?from=${from}&to=${to}`, "_blank");
  }

  async function handleRefundSubmit() {
    if (!refundModal.open) return;
    if (!refundNotes.trim()) {
      setRefundError("A reason note is required before issuing a refund.");
      return;
    }
    setRefundLoading(true);
    setRefundError(null);
    try {
      const body: Record<string, unknown> = {
        payment_id: refundModal.payment.id,
        notes: refundNotes.trim(),
      };
      if (refundAmount) body.amount = parseFloat(refundAmount);

      const res = await fetch(`${BASE}/api/admin/refunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Refund failed");
      setRefundSuccess(true);
      // Reload report after a moment
      setTimeout(() => {
        setRefundModal({ open: false });
        setRefundSuccess(false);
        setRefundAmount("");
        setRefundNotes("");
        loadReport();
      }, 1500);
    } catch (e) {
      setRefundError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRefundLoading(false);
    }
  }

  function openRefund(payment: Payment) {
    setRefundAmount("");
    setRefundNotes("");
    setRefundError(null);
    setRefundSuccess(false);
    setRefundModal({ open: true, payment });
  }

  const s = data?.summary;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Badge variant="outline" className="mb-2 border-amber-500 text-amber-400">Admin</Badge>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-zinc-400 mt-1">101 Night Market · All locations</p>
          </div>
          <Button
            onClick={handleExport}
            disabled={!data}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Export to Spreadsheet
          </Button>
        </div>

        {/* Date range controls */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs uppercase tracking-wide">From</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white w-44"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs uppercase tracking-wide">To</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white w-44"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { label: "This month", fn: () => { setFrom(monthStart); setTo(today); } },
                  { label: "Last 30 days", fn: () => { const d = new Date(); d.setDate(d.getDate() - 30); setFrom(d.toISOString().slice(0, 10)); setTo(today); } },
                  { label: "All time", fn: () => { setFrom("2024-01-01"); setTo(today); } },
                ].map(({ label, fn }) => (
                  <Button key={label} size="sm" variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
                    onClick={() => { fn(); }}
                  >{label}</Button>
                ))}
              </div>
              <Button onClick={loadReport} disabled={loading}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
                {loading ? "Loading…" : "Run Report"}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        {/* Summary cards */}
        {s && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Gross Revenue", value: fmt(s.totalGross), color: "text-white" },
              { label: "Whop Fees", value: fmt(s.totalFees), color: "text-zinc-400" },
              { label: "Dev Fee (3.5%)", value: fmt(s.devFeeTotal), color: "text-zinc-400" },
              { label: "Refunded", value: fmt(s.totalRefunded), color: "text-red-400" },
              { label: "Net to Business", value: fmt(s.netRevenue), color: "text-emerald-400" },
              { label: "Transactions", value: `${s.paymentCount} paid`, color: "text-zinc-300" },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payments table */}
        {data && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">
                Transactions
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  {data.payments.length} payment{data.payments.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.payments.length === 0 ? (
                <p className="px-6 pb-6 text-zinc-500 text-sm">No payments found for this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="px-6 py-3 text-left font-medium">Date (PT)</th>
                        <th className="px-4 py-3 text-left font-medium">Vendor</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Gross</th>
                        <th className="px-4 py-3 text-right font-medium">Whop Fee</th>
                        <th className="px-4 py-3 text-right font-medium">Dev 3.5%</th>
                        <th className="px-4 py-3 text-right font-medium">Net</th>
                        <th className="px-4 py-3 text-center font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payments.map((p) => {
                        const gross = p.final_amount ?? 0;
                        const fee = p.fee_amount ?? 0;
                        const dev = Math.round(gross * 0.035 * 100) / 100;
                        const net = Math.round((gross - fee - dev) * 100) / 100;
                        const refund = data.refunds.find((r) => r.payment_id === p.id);
                        return (
                          <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                            <td className="px-6 py-3 text-zinc-300 whitespace-nowrap">
                              {p.created_at ? fmtDate(p.created_at) : "—"}
                            </td>
                            <td className="px-4 py-3 text-zinc-300 max-w-[180px] truncate">
                              {p.user?.name ?? p.user?.email ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={
                                  refund
                                    ? "border-red-700 text-red-400"
                                    : p.status === "paid"
                                      ? "border-emerald-700 text-emerald-400"
                                      : "border-zinc-600 text-zinc-400"
                                }
                              >
                                {refund ? "refunded" : p.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right text-white">{fmt(gross)}</td>
                            <td className="px-4 py-3 text-right text-zinc-500">{fmt(fee)}</td>
                            <td className="px-4 py-3 text-right text-zinc-500">{fmt(dev)}</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-medium">{fmt(net)}</td>
                            <td className="px-4 py-3 text-center">
                              {!refund && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-800 text-red-400 hover:bg-red-950 text-xs h-7"
                                  onClick={() => openRefund(p)}
                                >
                                  Refund
                                </Button>
                              )}
                              {refund && (
                                <span className="text-xs text-zinc-600">
                                  –{fmt(refund.amount ?? 0)}
                                  {refund.notes && (
                                    <span title={refund.notes}> 📝</span>
                                  )}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refund Modal */}
      <Dialog
        open={refundModal.open}
        onOpenChange={(open) => !open && setRefundModal({ open: false })}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {refundModal.open && (
                <>
                  Payment <span className="font-mono text-xs text-zinc-300">{refundModal.payment.id}</span>
                  {" · "}
                  <span className="text-white font-medium">{fmt(refundModal.payment.final_amount ?? 0)}</span> original charge
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">
                Refund amount{" "}
                <span className="text-zinc-500 font-normal">(leave blank for full refund)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={refundModal.open ? (refundModal.payment.final_amount ?? 0).toFixed(2) : ""}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white pl-7"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">
                Reason / notes <span className="text-red-400">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Weather cancellation, vendor request, double booking…"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white resize-none"
                rows={3}
              />
            </div>

            {refundError && (
              <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded p-2">
                {refundError}
              </p>
            )}

            {refundSuccess && (
              <p className="text-sm text-emerald-400 bg-emerald-950/50 border border-emerald-800 rounded p-2">
                ✅ Refund issued successfully
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setRefundModal({ open: false })}
                disabled={refundLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold"
                onClick={handleRefundSubmit}
                disabled={refundLoading || refundSuccess}
              >
                {refundLoading ? "Processing…" : refundAmount ? `Refund $${refundAmount}` : "Full Refund"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
