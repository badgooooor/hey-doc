<script lang="ts">
  import { onDestroy } from "svelte";
  import { chatLogStore, pushChatLog, textSpeechStore } from "./stores";
  import Recording from "./components/Recording.svelte";
  import type { DisplayChatLog } from "./types";

  let message = ''
  let chatLogs: DisplayChatLog[] = [];

  const unsubscribeTextSpeechStore = textSpeechStore.subscribe(val => message = val);
  onDestroy(unsubscribeTextSpeechStore)

  const unsubscribeChatLogStore = chatLogStore.subscribe(val => chatLogs = val);
  onDestroy(unsubscribeChatLogStore);

  function onSendMessageClick() {
    pushChatLog(chatLogs, {
      role: 'user',
      content: message
    })
    message = ''
  }
</script>

<main>
  <div class="mx-8 my-8">
    <p class="text-2xl font-semibold">HeyDoctor!</p>
  </div>
  <div class="flex justify-center items-center h-[calc(100vh-128px)] mx-8 my-8">
    <div class="w-4/5">
      <div class="flex flex-col h-64 w-full overflow-auto mb-4 p-2 border-2 border-sky-500 rounded-md shadow">
        {#each chatLogs as chatLog}
          <p class="break-word mb-2"><span class="font-bold">{chatLog.role}:</span> {chatLog.content}</p>
        {/each}
      </div>
      <div class="flex items-center">
        <input 
          bind:value={message} 
          placeholder="Type your message"
          class="shadow grow appearance-none border rounded w-3/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <Recording />
        <button 
          on:click={onSendMessageClick}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
        >Send message</button>
      </div>
    </div>
  </div>
</main>
