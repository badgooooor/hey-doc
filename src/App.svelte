<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { conversationStore, displayedConversationStore, pushChatLog, textSpeechStore, userChatCountStore } from "./stores";
  import Recording from "./components/Recording.svelte";
  import type { ConversationLog } from "./types";
  import { postConversation } from "./services";
  import ChatLog from "./components/ChatLog.svelte";

  let message = ''
  let chatLogs: ConversationLog[] = [];
  let fullConversationLogs: ConversationLog[] = [];

  let userChatCount = 0;
  let assistantVoiceObjectURL: string | null = null;

  let isUserTurn = true;

  const unsubscirbeConversationStore = conversationStore.subscribe(val => fullConversationLogs = val)
  onDestroy(unsubscirbeConversationStore);

  const unsubscribeTextSpeechStore = textSpeechStore.subscribe(val => message = val);
  onDestroy(unsubscribeTextSpeechStore);

  const unsubscribeChatLogStore = displayedConversationStore.subscribe(val => chatLogs = val);
  onDestroy(unsubscribeChatLogStore);

  const unsubscirbeUserChatCountStore = userChatCountStore.subscribe(val => userChatCount = val);
  onDestroy(unsubscirbeUserChatCountStore);

  onDestroy(() => {
    conversationStore.set([])
  })

  onMount(async () => {
    isUserTurn = false;
    const initialConversationResponse = await postConversation({
      "scenario": "outbound/appointment-reminder",
      "conversation": [
        {
          "role": "user",
          "content": ""
        }
      ]
    })
    
    if (initialConversationResponse !== null) {
      conversationStore.set([...chatLogs, {
        role: 'assistant',
        content: initialConversationResponse.responseText
      }]);
    }
    isUserTurn = true;
  })

  $: userChatCount && sendConversation();
  async function sendConversation() {
    isUserTurn = false;
    const conversationResponse = await postConversation({
      "scenario": "outbound/appointment-reminder",
      "conversation": fullConversationLogs
    })

    if (conversationResponse !== null) {
      conversationStore.set([...fullConversationLogs, {
        role: 'assistant',
        content: conversationResponse.responseText.toString()
      }]);

      assistantVoiceObjectURL = conversationResponse.audioBlobObjectURL;
    }
    isUserTurn = true;
  }

  $: assistantVoiceObjectURL && playAssistantVoice();
  function playAssistantVoice() {
    if (assistantVoiceObjectURL === null) return;
      
    const audio = document.querySelector('audio');
    audio.src = assistantVoiceObjectURL;
    audio.play();
  }

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
      <!-- <div class="flex flex-col h-64 w-full overflow-auto mb-4 p-2 border-2 border-sky-500 rounded-md shadow">
        {#each chatLogs as chatLog}
          <p class="break-word mb-2"><span class="font-bold">{chatLog.role}:</span> {chatLog.content}</p>
        {/each}
      </div> -->
      <ChatLog isUserTurn={isUserTurn} />
      <div class="flex items-center">
        <input 
          bind:value={message} 
          placeholder="Type your message"
          class="shadow grow appearance-none border rounded w-3/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <Recording />
        <button 
          disabled={!isUserTurn}
          on:click={onSendMessageClick}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
        >Send message</button>
      </div>
    </div>
  </div>
</main>
