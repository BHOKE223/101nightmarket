import { useState } from "react";
import { MapPin, X, Star, ChevronRight, CheckCircle2 } from "lucide-react";

type Status = "available" | "taken" | "pending";

interface Booth {
  id: string;
  label: string;
  type: "standard" | "endcap";
  status: Status;
  price: number;
  side: "A" | "B" | "endcap";
  position: string;
}

// Generate 20 booths per side with realistic status distribution
function makeRow(side: "A" | "B", count: number, price: number, statuses: Status[]): Booth[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${side}${i + 1}`,
    label: `${side}${i + 1}`,
    type: "standard",
    status: statuses[i % statuses.length],
    price,
    side,
    position: `Side ${side}, booth ${i + 1}`,
  }));
}

const VN_STATUSES_A: Status[] = [
  "taken","available","available","taken","available","available","pending",
  "available","taken","available","available","taken","available","available",
  "pending","available","taken","available","available","taken",
];
const VN_STATUSES_B: Status[] = [
  "available","taken","available","available","taken","available","available",
  "taken","available","pending","available","available","taken","available",
  "available","taken","available","available","pending","available",
];
const HW_STATUSES_A: Status[] = [
  "available","available","taken","available","taken","available","available",
  "pending","available","taken","available","available","available","taken",
  "available","available","taken","available","pending","available",
];
const HW_STATUSES_B: Status[] = [
  "taken","available","available","taken","available","available","taken",
  "available","available","taken","available","pending","available","available",
  "taken","available","available","available","taken","available",
];

const MARKETS = {
  vanNuys: {
    name: "Van Nuys",
    sideA: makeRow("A", 20, 85, VN_STATUSES_A),
    sideB: makeRow("B", 20, 85, VN_STATUSES_B),
    endcapTop:    { id: "E1", label: "E1", type: "endcap" as const, status: "available" as const, price: 120, side: "endcap" as const, position: "Top end · corridor entrance" },
    endcapBottom: { id: "E2", label: "E2", type: "endcap" as const, status: "available" as const, price: 120, side: "endcap" as const, position: "Bottom end · corridor exit" },
  },
  hollywood: {
    name: "Hollywood",
    sideA: makeRow("A", 20, 95, HW_STATUSES_A),
    sideB: makeRow("B", 20, 95, HW_STATUSES_B),
    endcapTop:    { id: "E1", label: "E1", type: "endcap" as const, status: "taken" as const,     price: 135, side: "endcap" as const, position: "Top end · Hollywood Blvd entrance" },
    endcapBottom: { id: "E2", label: "E2", type: "endcap" as const, status: "available" as const, price: 135, side: "endcap" as const, position: "Bottom end · stage side exit" },
  },
};

// ── Cell components ────────────────────────────────────────────────────

function StandardCell({ booth, selected, onClick }: { booth: Booth; selected: boolean; onClick: () => void }) {
  const avail = booth.status === "available";
  const style =
    selected
      ? "bg-sky-500/30 border-sky-400 text-sky-200 scale-105 shadow-sky-500/30 shadow"
      : booth.status === "available"
      ? "bg-emerald-500/15 border-emerald-600 text-emerald-300 hover:bg-emerald-500/25 active:scale-[0.97]"
      : booth.status === "pending"
      ? "bg-yellow-500/15 border-yellow-600 text-yellow-400"
      : "bg-zinc-800/80 border-zinc-700 text-zinc-500";

  return (
    <div
      onClick={avail ? onClick : undefined}
      className={`flex flex-col items-center justify-center rounded border w-16 h-16 transition-all select-none flex-shrink-0 gap-0.5 ${style} ${avail ? "cursor-pointer" : "cursor-default"}`}
    >
      <span className="text-[13px] font-black leading-none">{booth.label}</span>
      <span className="text-[10px] font-semibold leading-none opacity-80">${booth.price}</span>
      <span className={`text-[9px] leading-none font-medium mt-0.5 ${
        booth.status === "available" ? "text-emerald-400/70" :
        booth.status === "pending"   ? "text-yellow-400/70"  : "text-zinc-600"
      }`}>
        {booth.status === "available" ? "open" : booth.status === "pending" ? "pending" : "taken"}
      </span>
    </div>
  );
}

function EndcapBar({ booth, selected, onClick }: { booth: Booth; selected: boolean; onClick: () => void }) {
  const avail = booth.status === "available";
  const style =
    selected
      ? "bg-sky-500/30 border-sky-400 text-sky-200 shadow-sky-500/30 shadow"
      : avail
      ? "bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30 active:scale-[0.99]"
      : "bg-zinc-800/80 border-zinc-700 text-zinc-500";

  return (
    <div
      onClick={avail ? onClick : undefined}
      className={`flex items-center justify-center gap-2 rounded border py-2.5 transition-all select-none ${style} ${avail ? "cursor-pointer" : "cursor-default"}`}
    >
      <Star className="w-3 h-3" />
      <span className="font-bold text-xs tracking-wide">ENDCAP {booth.label}</span>
      <span className="text-[10px] opacity-70">· ${booth.price}/night</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export function FloorMap() {
  const [market, setMarket] = useState<"vanNuys" | "hollywood">("vanNuys");
  const [selected, setSelected] = useState<Booth | null>(null);
  const [booked, setBooked] = useState(false);

  const data = MARKETS[market];
  const allBooths = [...data.sideA, ...data.sideB, data.endcapTop, data.endcapBottom];
  const available = allBooths.filter(b => b.status === "available").length;

  function select(b: Booth) { setSelected(b); }

  function handleBook() {
    setBooked(true);
    setTimeout(() => { setSelected(null); setBooked(false); }, 2200);
  }

  const statDot = (s: Status) =>
    s === "available" ? "bg-emerald-500" : s === "pending" ? "bg-yellow-500" : "bg-zinc-600";

  return (
    <div className="bg-zinc-950 text-white font-sans min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur z-30 px-4 pt-5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="font-bold text-sm">Select Your Booth</span>
          <span className="ml-auto text-xs text-zinc-500">{available} open</span>
        </div>
        <div className="flex bg-zinc-900 rounded-xl p-1 gap-1">
          {(["vanNuys", "hollywood"] as const).map(key => (
            <button key={key} onClick={() => { setMarket(key); setSelected(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${market === key ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"}`}>
              {MARKETS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Map body */}
      <div className="px-3 py-4 pb-10">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

          {/* Direction banner */}
          <div className="flex justify-between px-3 py-1.5 bg-zinc-800/50 text-[9px] text-zinc-500 uppercase tracking-widest">
            <span>↑ Entrance</span>
            <span>Floor Map — Top View</span>
            <span>Exit ↓</span>
          </div>

          <div className="px-3 py-3 flex flex-col gap-1.5">

            {/* ── TOP ENDCAP ───────────────────────────── */}
            <EndcapBar
              booth={data.endcapTop}
              selected={selected?.id === data.endcapTop.id && selected.side === "endcap"}
              onClick={() => select(data.endcapTop)}
            />

            {/* ── BOOTH COLUMNS ────────────────────────── */}
            <div className="flex gap-2">

              {/* Side A */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] text-zinc-600 uppercase tracking-widest text-center pb-0.5">Side A</div>
                {data.sideA.map(b => (
                  <StandardCell key={b.id} booth={b}
                    selected={selected?.id === b.id}
                    onClick={() => select(b)} />
                ))}
              </div>

              {/* Aisle separator */}
              <div className="flex flex-col items-center w-8 pt-5 self-stretch">
                <div className="flex-1 w-px bg-zinc-700/50" />
                <span className="text-[8px] text-zinc-600 uppercase tracking-[0.15em] my-2 whitespace-nowrap"
                  style={{ writingMode: "vertical-rl" }}>
                  ← aisle →
                </span>
                <div className="flex-1 w-px bg-zinc-700/50" />
              </div>

              {/* Side B */}
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] text-zinc-600 uppercase tracking-widest text-center pb-0.5">Side B</div>
                {data.sideB.map(b => (
                  <StandardCell key={b.id} booth={b}
                    selected={selected?.id === b.id}
                    onClick={() => select(b)} />
                ))}
              </div>
            </div>

            {/* ── BOTTOM ENDCAP ────────────────────────── */}
            <EndcapBar
              booth={data.endcapBottom}
              selected={selected?.id === data.endcapBottom.id && selected.side === "endcap"}
              onClick={() => select(data.endcapBottom)}
            />

          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 px-1 flex-wrap">
          {[
            { cls: "bg-emerald-500", label: "Available" },
            { cls: "bg-amber-400",   label: "Endcap ★" },
            { cls: "bg-yellow-500",  label: "Pending" },
            { cls: "bg-zinc-600",    label: "Taken" },
          ].map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
              <span className="text-[10px] text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {!selected && (
          <p className="text-center text-xs text-zinc-600 mt-5">Tap any open booth to book</p>
        )}
      </div>

      {/* ── BOOKING DRAWER ─────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 shadow-2xl">
            {booked ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="font-bold text-emerald-400">Booth {selected.label} reserved!</p>
                <p className="text-xs text-zinc-500">Payment link sent to your email</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-black">Booth {selected.label}</span>
                      {selected.type === "endcap" && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> ENDCAP
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{selected.position}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Type</p>
                    <p className="text-sm font-semibold capitalize">{selected.type}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Per Night</p>
                    <p className="text-sm font-semibold">${selected.price}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Hours</p>
                    <p className="text-sm font-semibold">5 pm – 10 pm</p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Days</p>
                    <p className="text-sm font-semibold">Thu – Sun</p>
                  </div>
                </div>

                <button onClick={handleBook}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                  Book & Pay ${selected.price}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
