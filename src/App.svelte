<script lang="ts">
  import { onDestroy } from "svelte";
  import { chatLogStore } from "./stores";

  type DisplayChatLog = {
    role: string;
    message: string;
  };
  
  let message = ''
  let chatLogs: DisplayChatLog[] = [];

  const unsubscribeChatLogStore = chatLogStore.subscribe(val => chatLogs = val);
  onDestroy(unsubscribeChatLogStore);

  function onSendMessageClick() {
    const updatedChatLog: DisplayChatLog[] = [...chatLogs, {
      role: 'You',
      message: message
    }];
    chatLogStore.set(updatedChatLog)
    message = ''
  }
</script>

<main>
  <h4>Svelte Chat</h4>
  <div class="chat-log-container">
    {#each chatLogs as chatLog}
      <p>{chatLog.role}: {chatLog.message}</p>
    {/each}
  </div>
  <div>
    <input bind:value={message} placeholder="Type your message" />
    <button on:click={onSendMessageClick}>Send message</button>
  </div>
</main>

<style>
  .chat-log-container {
    display: flex;
    flex-direction: column;
  }
</style>