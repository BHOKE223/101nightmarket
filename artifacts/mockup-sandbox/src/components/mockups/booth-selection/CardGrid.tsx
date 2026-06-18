import { useState } from "react";
import { Star, MapPin, Filter, CheckCircle2, ChevronRight } from "lucide-react";

interface Booth {
  id: string;
  label: string;
  type: "standard" | "endcap";
  status: "available" | "taken" | "pending";
  price: number;
  row: string;
  note: string;
}

const VAN_NUYS: Booth[] = [
  { id: "E1", label: "E1", type: "endcap",   status: "available", price: 120, row: "A", note: "Corner · high foot traffic" },
  { id: "A1", label: "A1", type: "standard", status: "taken",     price: 85,  row: "A", note: "Near entrance" },
  { id: "A2", label: "A2", type: "standard", status: "available", price: 85,  row: "A", note: "Center row" },
  { id: "A3", label: "A3", type: "standard", status: "taken",     price: 85,  row: "A", note: "Center row" },
  { id: "A4", label: "A4", type: "standard", status: "available", price: 85,  row: "A", note: "Center row" },
  { id: "A5", label: "A5", type: "standard", status: "pending",   price: 85,  row: "A", note: "Pending payment" },
  { id: "A6", label: "A6", type: "standard", status: "available", price: 85,  row: "A", note: "Near exit" },
  { id: "E2", label: "E2", type: "endcap",   status: "taken",     price: 120, row: "A", note: "Corner · near stage" },
  { id: "E3", label: "E3", type: "endcap",   status: "available", price: 120, row: "B", note: "Corner · food court side" },
  { id: "B1", label: "B1", type: "standard", status: "available", price: 85,  row: "B", note: "Near entrance" },
  { id: "B2", label: "B2", type: "standard", status: "taken",     price: 85,  row: "B", note: "Center row" },
  { id: "B3", label: "B3", type: "standard", status: "available", price: 85,  row: "B", note: "Center row" },
  { id: "B4", label: "B4", type: "standard", status: "taken",     price: 85,  row: "B", note: "Center row" },
  { id: "B5", label: "B5", type: "standard", status: "available", price: 85,  row: "B", note: "Center row" },
  { id: "B6", label: "B6", type: "standard", status: "pending",   price: 85,  row: "B", note: "Pending payment" },
  { id: "E4", label: "E4", type: "endcap",   status: "available", price: 120, row: "B", note: "Corner · best visibility" },
];

const HOLLYWOOD: Booth[] = [
  { id: "E1", label: "E1", type: "endcap",   status: "taken",     price: 135, row: "A", note: "Hollywood Blvd side" },
  { id: "A1", label: "A1", type: "standard", status: "available", price: 95,  row: "A", note: "Near entrance" },
  { id: "A2", label: "A2", type: "standard", status: "available", price: 95,  row: "A", note: "Center row" },
  { id: "A3", label: "A3", type: "standard", status: "taken",     price: 95,  row: "A", note: "Center row" },
  { id: "A4", label: "A4", type: "standard", status: "available", price: 95,  row: "A", note: "Center row" },
  { id: "A5", label: "A5", type: "standard", status: "available", price: 95,  row: "A", note: "Center row" },
  { id: "A6", label: "A6", type: "standard", status: "taken",     price: 95,  row: "A", note: "Near exit" },
  { id: "E2", label: "E2", type: "endcap",   status: "available", price: 135, row: "A", note: "Corner · stage view" },
  { id: "E3", label: "E3", type: "endcap",   status: "available", price: 135, row: "B", note: "Corner · main walk" },
  { id: "B1", label: "B1", type: "standard", status: "taken",     price: 95,  row: "B", note: "Near entrance" },
  { id: "B2", label: "B2", type: "standard", status: "available", price: 95,  row: "B", note: "Center row" },
  { id: "B3", label: "B3", type: "standard", status: "taken",     price: 95,  row: "B", note: "Center row" },
  { id: "B4", label: "B4", type: "standard", status: "available", price: 95,  row: "B", note: "Center row" },
  { id: "B5", label: "B5", type: "standard", status: "pending",   price: 95,  row: "B", note: "Pending payment" },
  { id: "B6", label: "B6", type: "standard", status: "available", price: 95,  row: "B", note: "Near exit" },
  { id: "E4", label: "E4", type: "endcap",   status: "taken",     price: 135, row: "B", note: "Back entrance" },
];

type FilterType = "all" | "available" | "endcap";

function BoothCard({ booth, selected, onSelect }: { booth: Booth; selected: boolean; onSelect: () => void }) {
  const isAvailable = booth.status === "available";
  const isEndcap = booth.type === "endcap";

  return (
    <div
      onClick={isAvailable ? onSelect : undefined}
      className={`rounded-2xl p-3.5 border transition-all ${
        selected
          ? "bg-red-600/20 border-red-500 shadow-lg shadow-red-500/20"
          : isAvailable
          ? "bg-zinc-900 border-zinc-700 hover:border-zinc-500 cursor-pointer active:scale-95"
          : "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl font-black leading-none ${selected ? "text-red-400" : isAvailable ? "text-white" : "text-zinc-600"}`}>
            {booth.label}
          </span>
          {isEndcap && (
            <Star className={`w-3.5 h-3.5 mt-1 ${isAvailable ? "text-amber-400" : "text-zinc-600"}`} fill="currentColor" />
          )}
        </div>

        {/* Status pill */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          selected
            ? "bg-red-500/20 border-red-500 text-red-300"
            : booth.status === "available"
            ? "bg-emerald-500/15 border-emerald-600 text-emerald-400"
            : booth.status === "pending"
            ? "bg-yellow-500/15 border-yellow-600 text-yellow-400"
            : "bg-zinc-700/50 border-zinc-600 text-zinc-500"
        }`}>
          {selected ? "Selected" : booth.status === "available" ? "Open" : booth.status === "pending" ? "Pending" : "Taken"}
        </span>
      </div>

      {/* Type badge */}
      <div className="flex items-center gap-1 mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
          isEndcap
            ? "bg-amber-500/15 text-amber-400"
            : "bg-zinc-800 text-zinc-400"
        }`}>
          {isEndcap ? "Endcap" : "Standard"}
        </span>
        <span className="text-[10px] text-zinc-600">Row {booth.row}</span>
      </div>

      {/* Note */}
      <p className="text-[11px] text-zinc-500 mb-3 truncate">{booth.note}</p>

      {/* Price + CTA */}
      <div className="flex items-center justify-between">
        <span className={`font-bold text-sm ${isAvailable ? "text-white" : "text-zinc-600"}`}>
          ${booth.price}<span className="text-zinc-500 font-normal text-xs">/night</span>
        </span>
        {isAvailable && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${selected ? "text-red-400" : "text-zinc-400"}`}>
            {selected ? "Tap to deselect" : "Select"} <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}

export function CardGrid() {
  const [market, setMarket] = useState<"vanNuys" | "hollywood">("vanNuys");
  const [filter, setFilter] = useState<FilterType>("available");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const allBooths = market === "vanNuys" ? VAN_NUYS : HOLLYWOOD;

  const filtered = allBooths.filter(b => {
    if (filter === "available") return b.status === "available";
    if (filter === "endcap") return b.type === "endcap" && b.status === "available";
    return true;
  });

  const selectedBooth = allBooths.find(b => b.id === selected);

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => {
      setSelected(null);
      setConfirmed(false);
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 sticky top-0 bg-zinc-950 z-10">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="font-bold text-sm">101 Night Market</span>
        </div>

        {/* Market selector */}
        <div className="flex bg-zinc-900 rounded-xl p-1 gap-1 mb-3">
          {[["vanNuys", "Van Nuys"], ["hollywood", "Hollywood"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setMarket(key as any); setSelected(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                market === key ? "bg-red-600 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
          {([["available", "Available"], ["endcap", "Endcap Only"], ["all", "All Booths"]] as [FilterType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                filter === key
                  ? "border-red-500 bg-red-500/15 text-red-400"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 pb-2">
        <p className="text-xs text-zinc-600">
          {filtered.length} booth{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 pb-32 grid grid-cols-2 gap-3 flex-1">
        {filtered.map(booth => (
          <BoothCard
            key={booth.id}
            booth={booth}
            selected={selected === booth.id}
            onSelect={() => setSelected(selected === booth.id ? null : booth.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-10 text-zinc-600 text-sm">
            No booths match this filter
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      {selectedBooth && (
        <div className="fixed inset-x-0 bottom-0 px-4 pb-6 pt-3 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20">
          {confirmed ? (
            <div className="bg-emerald-600 rounded-2xl py-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold">Booth {selectedBooth.label} reserved!</span>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-between px-5 transition-colors"
            >
              <span>Booth {selectedBooth.label} · {selectedBooth.type}</span>
              <span>${selectedBooth.price}/night →</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
