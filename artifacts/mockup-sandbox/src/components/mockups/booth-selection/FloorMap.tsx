import { useState } from "react";
import { MapPin, X, Star, ChevronRight, CheckCircle2 } from "lucide-react";

type BoothStatus = "available" | "taken" | "pending" | "endcap-available" | "endcap-taken";

interface Booth {
  id: string;
  label: string;
  type: "standard" | "endcap";
  status: "available" | "taken" | "pending";
  price: number;
  row: string;
  position: string;
}

const VAN_NUYS_BOOTHS: Booth[] = [
  { id: "E1", label: "E1", type: "endcap", status: "available", price: 120, row: "A", position: "Corner — high foot traffic" },
  { id: "A1", label: "A1", type: "standard", status: "taken",     price: 85,  row: "A", position: "Row A, near entrance" },
  { id: "A2", label: "A2", type: "standard", status: "available", price: 85,  row: "A", position: "Row A, center" },
  { id: "A3", label: "A3", type: "standard", status: "taken",     price: 85,  row: "A", position: "Row A, center" },
  { id: "A4", label: "A4", type: "standard", status: "available", price: 85,  row: "A", position: "Row A, center" },
  { id: "A5", label: "A5", type: "standard", status: "pending",   price: 85,  row: "A", position: "Row A, center" },
  { id: "A6", label: "A6", type: "standard", status: "available", price: 85,  row: "A", position: "Row A, near exit" },
  { id: "E2", label: "E2", type: "endcap", status: "taken",       price: 120, row: "A", position: "Corner — near stage" },
  { id: "E3", label: "E3", type: "endcap", status: "available",   price: 120, row: "B", position: "Corner — near food court" },
  { id: "B1", label: "B1", type: "standard", status: "available", price: 85,  row: "B", position: "Row B, near entrance" },
  { id: "B2", label: "B2", type: "standard", status: "taken",     price: 85,  row: "B", position: "Row B, center" },
  { id: "B3", label: "B3", type: "standard", status: "available", price: 85,  row: "B", position: "Row B, center" },
  { id: "B4", label: "B4", type: "standard", status: "taken",     price: 85,  row: "B", position: "Row B, center" },
  { id: "B5", label: "B5", type: "standard", status: "available", price: 85,  row: "B", position: "Row B, center" },
  { id: "B6", label: "B6", type: "standard", status: "pending",   price: 85,  row: "B", position: "Row B, near exit" },
  { id: "E4", label: "E4", type: "endcap", status: "available",   price: 120, row: "B", position: "Corner — best visibility" },
];

const HOLLYWOOD_BOOTHS: Booth[] = [
  { id: "E1", label: "E1", type: "endcap", status: "taken",     price: 135, row: "A", position: "Corner — Hollywood Blvd side" },
  { id: "A1", label: "A1", type: "standard", status: "available", price: 95, row: "A", position: "Row A, near entrance" },
  { id: "A2", label: "A2", type: "standard", status: "available", price: 95, row: "A", position: "Row A, center" },
  { id: "A3", label: "A3", type: "standard", status: "taken",   price: 95,  row: "A", position: "Row A, center" },
  { id: "A4", label: "A4", type: "standard", status: "available", price: 95, row: "A", position: "Row A, center" },
  { id: "A5", label: "A5", type: "standard", status: "available", price: 95, row: "A", position: "Row A, center" },
  { id: "A6", label: "A6", type: "standard", status: "taken",   price: 95,  row: "A", position: "Row A, near exit" },
  { id: "E2", label: "E2", type: "endcap", status: "available", price: 135, row: "A", position: "Corner — stage view" },
  { id: "E3", label: "E3", type: "endcap", status: "available", price: 135, row: "B", position: "Corner — main walk" },
  { id: "B1", label: "B1", type: "standard", status: "taken",   price: 95,  row: "B", position: "Row B" },
  { id: "B2", label: "B2", type: "standard", status: "available", price: 95, row: "B", position: "Row B, center" },
  { id: "B3", label: "B3", type: "standard", status: "taken",   price: 95,  row: "B", position: "Row B, center" },
  { id: "B4", label: "B4", type: "standard", status: "available", price: 95, row: "B", position: "Row B, center" },
  { id: "B5", label: "B5", type: "standard", status: "pending", price: 95,  row: "B", position: "Row B, center" },
  { id: "B6", label: "B6", type: "standard", status: "available", price: 95, row: "B", position: "Row B, near exit" },
  { id: "E4", label: "E4", type: "endcap", status: "taken",     price: 135, row: "B", position: "Corner — back entrance" },
];

function BoothCell({ booth, selected, onClick }: { booth: Booth; selected: boolean; onClick: () => void }) {
  const isAvailable = booth.status === "available";
  const isEndcap = booth.type === "endcap";

  const baseStyle = "flex flex-col items-center justify-center rounded cursor-pointer transition-all select-none border font-bold text-xs";
  const sizeStyle = isEndcap ? "w-10 h-14" : "w-9 h-12";

  const colorStyle =
    selected
      ? "bg-sky-500 border-sky-300 text-white shadow-lg shadow-sky-500/50 scale-110"
      : booth.status === "available"
      ? isEndcap
        ? "bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/40 hover:scale-105"
        : "bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30 hover:scale-105"
      : booth.status === "pending"
      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-not-allowed"
      : "bg-zinc-700/60 border-zinc-600 text-zinc-500 cursor-not-allowed";

  return (
    <div
      className={`${baseStyle} ${sizeStyle} ${colorStyle}`}
      onClick={isAvailable ? onClick : undefined}
    >
      {isEndcap && <Star className="w-2.5 h-2.5 mb-0.5" />}
      <span>{booth.label}</span>
    </div>
  );
}

export function FloorMap() {
  const [market, setMarket] = useState<"vanNuys" | "hollywood">("vanNuys");
  const [selected, setSelected] = useState<Booth | null>(null);
  const [booked, setBooked] = useState(false);

  const booths = market === "vanNuys" ? VAN_NUYS_BOOTHS : HOLLYWOOD_BOOTHS;
  const rowA = booths.slice(0, 8);
  const rowB = booths.slice(8, 16);

  const available = booths.filter(b => b.status === "available").length;

  function handleBook() {
    setBooked(true);
    setTimeout(() => {
      setSelected(null);
      setBooked(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-zinc-300">Select Your Booth</span>
        </div>
        <p className="text-xs text-zinc-500">{available} spots available this weekend</p>
      </div>

      {/* Market selector */}
      <div className="px-4 mb-4">
        <div className="flex bg-zinc-900 rounded-xl p-1 gap-1">
          {[["vanNuys", "Van Nuys"], ["hollywood", "Hollywood"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setMarket(key as any); setSelected(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                market === key
                  ? "bg-red-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="px-4 flex-1">
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          {/* Entrance label */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Entrance →</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">← Exit</span>
          </div>

          {/* Row A */}
          <div className="mb-1">
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Row A</span>
            <div className="flex gap-1 items-center">
              {rowA.map(b => (
                <BoothCell
                  key={b.id}
                  booth={b}
                  selected={selected?.id === b.id}
                  onClick={() => setSelected(b)}
                />
              ))}
            </div>
          </div>

          {/* Aisle */}
          <div className="flex items-center gap-1 my-2.5">
            <div className="flex-1 border-t border-dashed border-zinc-700" />
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest px-2">Aisle</span>
            <div className="flex-1 border-t border-dashed border-zinc-700" />
          </div>

          {/* Row B */}
          <div>
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1.5">Row B</span>
            <div className="flex gap-1 items-center">
              {rowB.map(b => (
                <BoothCell
                  key={b.id}
                  booth={b}
                  selected={selected?.id === b.id}
                  onClick={() => setSelected(b)}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {[
              { color: "bg-emerald-500", label: "Available" },
              { color: "bg-amber-400", label: "Endcap" },
              { color: "bg-yellow-500", label: "Pending" },
              { color: "bg-zinc-600", label: "Taken" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                <span className="text-[10px] text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt */}
        {!selected && (
          <p className="text-center text-xs text-zinc-600 mt-4">
            Tap an available booth to see details
          </p>
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

                <button
                  onClick={handleBook}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
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
