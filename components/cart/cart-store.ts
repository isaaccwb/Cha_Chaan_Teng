"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 純前端購物車 state。呢度嘅價錢淨係用嚟畀客人睇住「大概幾錢」,
 * 真正落單一刻 lib/actions/order.ts 嘅 createOrder 會用 DB 現價重新
 * 計過(防炒價),所以呢個 store 唔使、亦都唔應該做任何金額驗證邏輯。
 */

export interface CartOptionSelection {
  optionId: string;
  name: string;
  priceDelta: number;
}

export interface CartLine {
  /** 呢張購物車入面呢一行嘅 id,唔係 menu_items.id(同一味嘢唔同配搭會係唔同行) */
  lineId: string;
  menuItemId: string;
  name: string;
  imageUrl: string | null;
  /** 落單一刻嘅單價(底價,未計 options) */
  unitPrice: number;
  options: CartOptionSelection[];
  quantity: number;
  notes: string;
}

interface CartState {
  tableNumber: string;
  lines: CartLine[];
  setTableNumber: (value: string) => void;
  addItem: (input: Omit<CartLine, "lineId">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  getTotal: () => number;
  getCount: () => number;
}

function lineSignature(input: Omit<CartLine, "lineId">) {
  const optionIds = input.options
    .map((o) => o.optionId)
    .sort()
    .join(",");
  return `${input.menuItemId}::${optionIds}::${input.notes.trim()}`;
}

function lineUnitTotal(line: CartLine) {
  const optionsSum = line.options.reduce((sum, o) => sum + o.priceDelta, 0);
  return line.unitPrice + optionsSum;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: "",
      lines: [],

      setTableNumber: (value) => set({ tableNumber: value }),

      addItem: (input) => {
        const signature = lineSignature(input);
        const existing = get().lines.find((line) => lineSignature(line) === signature);

        if (existing) {
          set({
            lines: get().lines.map((line) =>
              line.lineId === existing.lineId
                ? { ...line, quantity: line.quantity + input.quantity }
                : line
            ),
          });
          return;
        }

        set({
          lines: [...get().lines, { ...input, lineId: crypto.randomUUID() }],
        });
      },

      removeItem: (lineId) => set({ lines: get().lines.filter((l) => l.lineId !== lineId) }),

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }
        set({
          lines: get().lines.map((line) => (line.lineId === lineId ? { ...line, quantity } : line)),
        });
      },

      clear: () => set({ lines: [], tableNumber: "" }),

      getTotal: () => get().lines.reduce((sum, line) => sum + lineUnitTotal(line) * line.quantity, 0),

      getCount: () => get().lines.reduce((sum, line) => sum + line.quantity, 0),
    }),
    {
      name: "cct-cart",
      // V1 得一間茶記,一個瀏覽器同一時間淨係應該有一張未落嘅單
      partialize: (state) => ({ tableNumber: state.tableNumber, lines: state.lines }),
    }
  )
);
