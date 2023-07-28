import { writable } from "svelte/store";
import type { DisplayChatLog } from "../types";

export const chatLogStore = writable<DisplayChatLog[]>([]);

export const pushChatLog = (
  chatLogs: DisplayChatLog[],
  updatingChatLog: DisplayChatLog
): void => {
  const updatedChatLogs = [...chatLogs, updatingChatLog];
  chatLogStore.set(updatedChatLogs);
};

export const textSpeechStore = writable<string | null>(null);
