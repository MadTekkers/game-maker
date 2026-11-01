import { describe, expect, it } from "vitest";
import { matchAnswer, norm } from "./match";
import type { Prompt } from "./types";

const P: Prompt = { id: "t", cat: "geo", q: "test", answers: [
  { t: "Côte d'Ivoire", a: ["Ivory Coast"], p: 50 },
  { t: "The Godfather Part II", a: ["Godfather 2"], p: 30 },
  { t: "The Godfather", p: 10 },
  { t: "Saint Lucia", p: 70 },
  { t: "Harry Potter and the Deathly Hallows – Part 1", a: ["Deathly Hallows Part 1", "Deathly Hallows"], p: 60 },
  { t: "Harry Potter and the Deathly Hallows – Part 2", a: ["Deathly Hallows Part 2", "Deathly Hallows"], p: 40 },
  { t: "Chad", p: 80 },
  { t: "The Lord of the Rings: The Return of the King", p: 45 },
  { t: "Mississippi", p: 20 },
  { t: "Spider-Man", p: 20 },
  { t: "Brighton & Hove Albion", a: ["Brighton"], p: 90 },
]};
const hit = (g: string) => { const r = matchAnswer(P, g); return r.kind === "hit" ? r.answer.t : r.kind; };

describe("deep dive matcher", () => {
  it("normalises case, accents, punctuation, leading the, saint, roman numerals", () => {
    expect(norm("The Godfather Part II")).toBe("godfather part 2");
    expect(norm("St. Lucia")).toBe(norm("Saint Lucia"));
    expect(hit("cote divoire")).toBe("Côte d'Ivoire");
    expect(hit("IVORY COAST")).toBe("Côte d'Ivoire");
    expect(hit("st lucia")).toBe("Saint Lucia");
    expect(hit("godfather part 2")).toBe("The Godfather Part II");
    expect(hit("brighton and hove albion")).toBe("Brighton & Hove Albion");
    expect(hit("spiderman")).toBe("Spider-Man");
    expect(hit("return of the king")).toBe("The Lord of the Rings: The Return of the King");
  });
  it("allows small typos scaled to length", () => {
    expect(hit("Missisippi")).toBe("Mississippi");
    expect(hit("Misisipi")).toBe("miss"); // 3 edits is too many
    expect(hit("chda")).toBe("Chad");
    expect(hit("cha")).toBe("miss");
    expect(hit("xyzzy")).toBe("miss");
  });
  it("never fuzzes across different numbers", () => {
    expect(hit("godfather part 3")).toBe("miss");
  });
  it("flags ambiguous aliases", () => {
    expect(matchAnswer(P, "deathly hallows").kind).toBe("ambiguous");
    expect(hit("deathly hallows part 2")).toBe("Harry Potter and the Deathly Hallows – Part 2");
  });
});
