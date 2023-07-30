<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { conversationStore, displayedConversationStore, pushChatLog, textSpeechStore, userChatCountStore } from "./stores";
  import Recording from "./components/Recording.svelte";
  import type { ConversationLog } from "./types";
  import { postConversation } from "./services";
  import ChatLog from "./components/ChatLog.svelte";
  import { toast } from "@zerodevx/svelte-toast";

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
        content: initialConversationResponse.responseText.toString(),
      }]);

      assistantVoiceObjectURL = initialConversationResponse.audioBlobObjectURL;
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
    try {
      if (assistantVoiceObjectURL === null) return;
      
      const audio = new Audio(assistantVoiceObjectURL);
      audio.play();
    } catch(err) {
      toast.push('Error occured')
    }
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
    <p class="text-2xl font-semibold text-indigo-800">HeyDoctor!</p>
  </div>
  <div class="flex justify-center items-center h-[calc(100vh-128px)] mx-8 my-8">
    <div class="w-4/5">
      <div class="flex flex-col mb-8">
        <p class="font-semibold text-slate-800 mb-2">Chat log</p>
        <ChatLog isUserTurn={isUserTurn} />
      </div>
      <p class="font-semibold text-slate-800 mb-2">User input</p>
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
          class="bg-blue-100 border-blue-500 border-2 text-blue-500 hover:bg-blue-700 hover:border-blue-700 hover:text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
        >Send message</button>
      </div>
    </div>
  </div>
</main>
