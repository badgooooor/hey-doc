import { derived, writable } from "svelte/store";
import type { ConversationLog } from "../types";

export const conversationStore = writable<ConversationLog[]>([]);

export const displayedConversationStore = derived(
  conversationStore,
  ($conversationLogs) => {
    return $conversationLogs.filter((log) => log.content.length > 0);
  }
);

export const userChatCountStore = derived(
  conversationStore,
  ($conversationLogs) => {
    return $conversationLogs.filter(
      (log) => log.content.length > 0 && log.role === "user"
    ).length;
  }
);

export const chatLogStore = writable<ConversationLog[]>([]);

export const pushChatLog = (
  chatLogs: ConversationLog[],
  updatingChatLog: ConversationLog
): void => {
  const updatedChatLogs = [...chatLogs, updatingChatLog];
  conversationStore.set(updatedChatLogs);
};

export const textSpeechStore = writable<string | null>(null);
