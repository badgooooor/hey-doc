<script lang="ts">
  import { onDestroy } from "svelte";
  import { displayedConversationStore } from "../stores";
  import type { ConversationLog } from "../types";

  export let isUserTurn: boolean;
  let chatLogs: ConversationLog[] = [];

  const unsubscribeChatLogStore = displayedConversationStore.subscribe(val => chatLogs = val);
  onDestroy(unsubscribeChatLogStore);
</script>

<div class="flex flex-col h-64 w-full overflow-auto mb-4 p-2 border-2 border-slate-900 bg-slate-900 rounded-md shadow">
  {#each chatLogs as chatLog}
    <p class="break-word mb-2 text-white"><span class="font-bold">{chatLog.role}:</span> {chatLog.content}</p>
  {/each}
  {#if !isUserTurn}
    <p class="loading text-white">Assistant is replying. Please wait</p>
  {/if}
</div>
