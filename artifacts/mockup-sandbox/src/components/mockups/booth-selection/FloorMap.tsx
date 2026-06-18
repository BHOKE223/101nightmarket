import { useState } from "react";
import { MapPin, X, Star, ChevronRight, CheckCircle2 } from "lucide-react";

interface Booth {
  id: string;
  label: string;
  type: "standard" | "endcap";
  status: "available" | "taken" | "pending";
  price: number;
  row: string;
  position: string;
}

const VAN_NUYS_ROWS: Booth[] = [
  { id: "A1", label: "A1", type: "standard", status: "taken",     price: 85,  row: "A", position: "Row A, near entrance" },
  { id: "A2", label: "A2", type: "standard", status: "available", price: 85,  row: "A", position: "Row A, center" },
  { id: "A3", label: "A3", type: "standard", status: "taken",     price: 85,  row: "A", position: "Row A, center" },
  { id: "A4", label: "A4", type: "standard", status: "available", price: 85,  row: "A", position: "Row A, center" },
  { id: "A5", label: "A5", type: "standard", status: "pending",   price: 85,  row: "A", position: "Row A, center" },
  { id: "A6", label: "A6", type: "standard", status: "available", price: 85,  row: "A", position: "Row A, near exit" },
  { id: "B1", label: "B1", type: "standard", status: "available", price: 85,  row: "B", position: "Row B, near entrance" },
  { id: "B2", label: "B2", type: "standard", status: "taken",     price: 85,  row: "B", position: "Row B, center" },
  { id: "B3", label: "B3", type: "standard", status: "available", price: 85,  row: "B", position: "Row B, center" },
  { id: "B4", label: "B4", type: "standard", status: "taken",     price: 85,  row: "B", position: "Row B, center" },
  { id: "B5", label: "B5", type: "standard", status: "available", price: 85,  row: "B", position: "Row B, center" },
  { id: "B6", label: "B6", type: "standard", status: "pending",   price: 85,  row: "B", position: "Row B, near exit" },
];

// Endcaps at the left and right ends of the aisle (2 per end, stacked)
const VAN_NUYS_ENDCAPS = {
  left:  [
    { id: "E1", label: "E1", type: "endcap" as const, status: "available" as const, price: 120, row: "Aisle", position: "Left end · aisle entrance, Row A side" },
    { id: "E3", label: "E3", type: "endcap" as const, status: "available" as const, price: 120, row: "Aisle", position: "Left end · aisle entrance, Row B side" },
  ],
  right: [
    { id: "E2", label: "E2", type: "endcap" as const, status: "taken"     as const, price: 120, row: "Aisle", position: "Right end · aisle exit, Row A side" },
    { id: "E4", label: "E4", type: "endcap" as const, status: "available" as const, price: 120, row: "Aisle", position: "Right end · aisle exit, Row B side" },
  ],
};

const HOLLYWOOD_ROWS: Booth[] = [
  { id: "A1", label: "A1", type: "standard", status: "available", price: 95, row: "A", position: "Row A, near entrance" },
  { id: "A2", label: "A2", type: "standard", status: "available", price: 95, row: "A", position: "Row A, center" },
  { id: "A3", label: "A3", type: "standard", status: "taken",   price: 95,  row: "A", position: "Row A, center" },
  { id: "A4", label: "A4", type: "standard", status: "available", price: 95, row: "A", position: "Row A, center" },
  { id: "A5", label: "A5", type: "standard", status: "available", price: 95, row: "A", position: "Row A, center" },
  { id: "A6", label: "A6", type: "standard", status: "taken",   price: 95,  row: "A", position: "Row A, near exit" },
  { id: "B1", label: "B1", type: "standard", status: "taken",   price: 95,  row: "B", position: "Row B" },
  { id: "B2", label: "B2", type: "standard", status: "available", price: 95, row: "B", position: "Row B, center" },
  { id: "B3", label: "B3", type: "standard", status: "taken",   price: 95,  row: "B", position: "Row B, center" },
  { id: "B4", label: "B4", type: "standard", status: "available", price: 95, row: "B", position: "Row B, center" },
  { id: "B5", label: "B5", type: "standard", status: "pending", price: 95,  row: "B", position: "Row B, center" },
  { id: "B6", label: "B6", type: "standard", status: "available", price: 95, row: "B", position: "Row B, near exit" },
];

const HOLLYWOOD_ENDCAPS = {
  left:  [
    { id: "E1", label: "E1", type: "endcap" as const, status: "taken"     as const, price: 135, row: "Aisle", position: "Left end · Hollywood Blvd side, Row A" },
    { id: "E3", label: "E3", type: "endcap" as const, status: "available" as const, price: 135, row: "Aisle", position: "Left end · Hollywood Blvd side, Row B" },
  ],
  right: [
    { id: "E2", label: "E2", type: "endcap" as const, status: "available" as const, price: 135, row: "Aisle", position: "Right end · stage view, Row A" },
    { id: "E4", label: "E4", type: "endcap" as const, status: "taken"     as const, price: 135, row: "Aisle", position: "Right end · stage view, Row B" },
  ],
};

function StandardCell({ booth, selected, onClick }: { booth: Booth; selected: boolean; onClick: () => void }) {
  const isAvailable = booth.status === "available";
  const colorStyle =
    selected
      ? "bg-sky-500 border-sky-300 text-white shadow-lg shadow-sky-500/40 scale-110"
      : booth.status === "available"
      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30 hover:scale-105"
      : booth.status === "pending"
      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-not-allowed"
      : "bg-zinc-700/60 border-zinc-600 text-zinc-500 cursor-not-allowed";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded border font-bold text-xs w-9 h-11 transition-all select-none ${colorStyle} ${isAvailable ? "cursor-pointer" : ""}`}
      onClick={isAvailable ? onClick : undefined}
    >
      {booth.label}
    </div>
  );
}

function EndcapCell({ booth, selected, onClick }: { booth: Booth; selected: boolean; onClick: () => void }) {
  const isAvailable = booth.status === "available";
  const colorStyle =
    selected
      ? "bg-sky-500 border-sky-300 text-white shadow-lg shadow-sky-500/40 scale-110"
      : booth.status === "available"
      ? "bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 hover:scale-105"
      : booth.status === "pending"
      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-not-allowed"
      : "bg-zinc-700/60 border-zinc-600 text-zinc-500 cursor-not-allowed";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded border font-bold text-[11px] w-11 h-11 transition-all select-none gap-0.5 ${colorStyle} ${isAvailable ? "cursor-pointer" : ""}`}
      onClick={isAvailable ? onClick : undefined}
    >
      <Star className="w-2.5 h-2.5" />
      {booth.label}
    </div>
  );
}

export function FloorMap() {
  const [market, setMarket] = useState<"vanNuys" | "hollywood">("vanNuys");
  const [selected, setSelected] = useState<Booth | null>(null);
  const [booked, setBooked] = useState(false);

  const rows    = market === "vanNuys" ? VAN_NUYS_ROWS    : HOLLYWOOD_ROWS;
  const endcaps = market === "vanNuys" ? VAN_NUYS_ENDCAPS : HOLLYWOOD_ENDCAPS;

  const rowA = rows.slice(0, 6);
  const rowB = rows.slice(6, 12);

  const allBooths = [...rows, ...endcaps.left, ...endcaps.right];
  const available = allBooths.filter(b => b.status === "available").length;

  function select(b: Booth) { setSelected(b); }

  function handleBook() {
    setBooked(true);
    setTimeout(() => { setSelected(null); setBooked(false); }, 2200);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-zinc-300">Select Your Booth</span>
        </div>
        <p className="text-xs text-zinc-500">{available} spots available this weekend</p>
      </div>

      {/* Market selector */}
      <div className="px-4 mb-5">
        <div className="flex bg-zinc-900 rounded-xl p-1 gap-1">
          {([["vanNuys", "Van Nuys"], ["hollywood", "Hollywood"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => { setMarket(key); setSelected(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${market === key ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="px-3 flex-1">
        <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800">

          {/* Direction labels */}
          <div className="flex justify-between mb-2 px-1">
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Entrance →</span>
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest">← Exit</span>
          </div>

          {/* 3-column layout: left endcaps | rows | right endcaps */}
          <div className="flex gap-2 items-stretch">

            {/* LEFT endcaps — stacked at left end of aisle */}
            <div className="flex flex-col gap-1 justify-center">
              {endcaps.left.map(b => (
                <EndcapCell key={b.id} booth={b as Booth} selected={selected?.id === b.id} onClick={() => select(b as Booth)} />
              ))}
            </div>

            {/* Center: Row A / Aisle / Row B */}
            <div className="flex-1 flex flex-col gap-0">

              {/* Row A */}
              <div>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1">Row A</span>
                <div className="flex gap-1">
                  {rowA.map(b => (
                    <StandardCell key={b.id} booth={b} selected={selected?.id === b.id} onClick={() => select(b)} />
                  ))}
                </div>
              </div>

              {/* Aisle */}
              <div className="my-2.5 flex items-center gap-1">
                <div className="flex-1 border-t border-dashed border-zinc-700" />
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest px-1.5
                  border border-zinc-700 rounded py-0.5">Aisle</span>
                <div className="flex-1 border-t border-dashed border-zinc-700" />
              </div>

              {/* Row B */}
              <div>
                <div className="flex gap-1">
                  {rowB.map(b => (
                    <StandardCell key={b.id} booth={b} selected={selected?.id === b.id} onClick={() => select(b)} />
                  ))}
                </div>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mt-1">Row B</span>
              </div>
            </div>

            {/* RIGHT endcaps — stacked at right end of aisle */}
            <div className="flex flex-col gap-1 justify-center">
              {endcaps.right.map(b => (
                <EndcapCell key={b.id} booth={b as Booth} selected={selected?.id === b.id} onClick={() => select(b as Booth)} />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {[
              { color: "bg-emerald-500", label: "Available" },
              { color: "bg-amber-400",   label: "Endcap ★" },
              { color: "bg-yellow-500",  label: "Pending" },
              { color: "bg-zinc-600",    label: "Taken" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                <span className="text-[10px] text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {!selected && (
          <p className="text-center text-xs text-zinc-600 mt-4">Tap an available booth to see details</p>
        )}
      </div>

      {/* Bottom drawer */}
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
