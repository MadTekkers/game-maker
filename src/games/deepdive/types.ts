export type CatId = "geo" | "mtv" | "sp" | "pc" | "sci" | "hi";
export interface Answer { t: string; a?: string[]; p: number; tip?: string; w?: string }
export interface Prompt { id: string; cat: CatId; q: string; note?: string; answers: Answer[] }
export interface Bank { version: string; source: string; categories: { id: CatId; name: string }[]; prompts: Prompt[] }
