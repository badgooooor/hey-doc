<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { chatLogStore } from "./stores";

  type DisplayChatLog = {
    role: string;
    message: string;
  };
  
  let message = ''
  let chatLogs: DisplayChatLog[] = [];

  let media: Blob[] = [];
  let mediaRecorder: MediaRecorder | null = null;
  onMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.ondataavailable = (e) => media.push(e.data)
		mediaRecorder.onstop = function(){
			const audio = document.querySelector('audio');
			const blob = new Blob(media, {'type' : 'audio/ogg; codecs=opus' });
			media = [];
      console.log(media)
			audio.src = window.URL.createObjectURL(blob);
		}
  })

  function startRecording(){
    console.log('starttt')
		mediaRecorder.start();
	}

	function stopRecording(){
    console.log('stoppp')

		mediaRecorder.stop();
	}

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
  <div class="mx-8 my-8">
    <p class="text-2xl font-semibold">HeyDoctor!</p>
  </div>
  <div class="flex justify-center items-center h-[calc(100vh-128px)] mx-8 my-8">
    <div class="w-4/5">
      <div class="flex flex-col h-64 w-full overflow-auto mb-4 p-2 border-2 border-sky-500 rounded-md shadow">
        {#each chatLogs as chatLog}
          <p class="break-word mb-2"><span class="font-bold">{chatLog.role}:</span> {chatLog.message}</p>
        {/each}
      </div>
      <div class="">
        <div>Speech to text</div>
        <audio controls />
        <button on:click={startRecording}>Record</button>
        <button on:click={stopRecording}>Stop</button>
      </div>
      <div class="flex items-center">
        <input 
          bind:value={message} 
          placeholder="Type your message"
          class="shadow grow appearance-none border rounded w-3/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button 
          on:click={onSendMessageClick}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
        >Send message</button>
      </div>
    </div>
  </div>
</main>
