import { writable } from "svelte/store";
import type { DisplayChatLog } from "../types";

export const chatLogStore = writable<DisplayChatLog[]>([]);

export const textSpeechStore = writable<string | null>(null);
