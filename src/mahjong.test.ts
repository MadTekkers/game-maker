import { describe, expect, it } from "vitest";
import * as E from "./cards/mahjong/engine";
import { shantenOf, scoreHand, waits, analyzeDiscards } from "./cards/mahjong/hand";
import { seededRng } from "./cards/core";
const h = (s: string) => s.trim().split(/\s+/);

describe("mahjong hand analysis", () => {
  it("shanten and waits", () => {
    expect(shantenOf(h("1m 2m 3m 4p 5p 6p 7s 8s 9s 1z 1z 1z 5z 5z"), 0)).toBe(-1);
    expect(shantenOf(h("1m 2m 3m 4p 5p 6p 7s 8s 9s 1z 1z 1z 5z"), 0)).toBe(0);
    expect(shantenOf(h("1m 9m 1p 9p 1s 9s 1z 2z 3z 4z 5z 6z 7z"), 0)).toBe(0); // thirteen orphans, 13-way wait
    expect(shantenOf(h("1m 1m 3p 3p 5s 5s 7s 7s 2z 2z 6z 6z 9m"), 0)).toBe(0); // seven pairs
    expect(waits(h("1m 2m 3m 4p 5p 6p 7s 8s 9s 1z 1z 2m 3m"), 0)).toEqual(["1m", "4m"]);
    expect(shantenOf(h("4p 5p 6p 7s 8s 9s 1z 1z 2m 3m"), 1)).toBe(0); // with one declared set
  });
  it("best discard keeps the most useful tiles", () => {
    const o = analyzeDiscards(h("1m 2m 3m 4p 5p 6p 7s 8s 9s 1z 1z 2m 3m 7z"), 0, new Array(34).fill(0), 100);
    expect(o[0].tile).toBe("7z"); expect(o[0].shanten).toBe(0); expect(o[0].live).toBe(8);
  });
  it("faan scoring", () => {
    const flush = scoreHand({ concealed: h("1m 2m 3m 4m 5m 6m 7m 8m 9m 5z 5z 5z 2m 2m"), melds: [], flowers: [], seatWind: 0, roundWind: 0, selfDraw: true })!;
    expect(flush.items.map((i) => i.name)).toEqual(["Self-draw", "Concealed hand", "Half flush", "No flowers", "Red dragon pung"]);
    expect(flush.faan).toBe(7); expect(flush.points).toBe(48);
    const pungs = scoreHand({ concealed: h("1z 1z 1z 2p 2p"), melds: [{ type: "pung", tiles: h("5m 5m 5m"), concealed: false, from: 1 }, { type: "pung", tiles: h("9s 9s 9s"), concealed: false, from: 2 }, { type: "kong", tiles: h("3p 3p 3p 3p"), concealed: false, from: 2 }], flowers: ["1f"], seatWind: 0, roundWind: 0, selfDraw: false })!;
    expect(pungs.items.map((i) => i.name)).toEqual(["Own flower", "All pungs", "Seat wind pung (East)", "Round wind pung (East)"]);
    expect(scoreHand({ concealed: h("1m 9m 1p 9p 1s 9s 1z 2z 3z 4z 5z 6z 7z 7z"), melds: [], flowers: [], seatWind: 1, roundWind: 0, selfDraw: false })!.limit).toBe(true);
  });
});
describe("mahjong engine", () => {
  it("bots play whole hands; tiles are conserved and points sum to zero", () => {
    const rng = seededRng(11); const s = E.newTable({ botLevel: "hard", now: 0, rng }); s.seats[0].kind = "human";
    for (let k = 0; k < 6; k++) {
      E.botsHand(s, { rng, now: 0 }); expect(s.phase).toBe("handover");
      const H = s.h!; const tot = H.hands.flat().length + H.wall.length + H.dead.length + H.ponds.flat().length + H.melds.flat().flatMap((m) => m.tiles).length + H.flowers.flat().length;
      expect(tot).toBe(144); expect(s.lastHand!.pay.reduce((a, b) => a + b, 0)).toBe(0);
    }
    expect(s.points.reduce((a, b) => a + b, 0)).toBe(0);
  }, 30000);
  it("public view never carries the wall or other hands", () => {
    const rng = seededRng(3); let s = E.newTable({ botLevel: "medium", now: 0, rng });
    s = E.seatHuman(s, 0, { name: "Ryan", tokenHash: "x", stack: 1000 }, { rng, now: 0 });
    const v = JSON.stringify(E.publicView(s));
    expect(s.phase).toBe("play"); expect(v).not.toContain('"wall":'); expect(v).not.toContain('"dead":'); expect(E.publicView(s).hands).toBeNull();
    expect(E.privateView(s, 0)!.hand.length).toBe(s.h!.hands[0].length);
  });
});
