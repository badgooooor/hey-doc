<script lang="ts">
  import { onMount } from "svelte";
  import { ENV_OBJ } from "../lib/env";
  import { textSpeechStore } from "../stores";
  import { toast } from "@zerodevx/svelte-toast";
  
  let media: Blob[] = [];
  let mediaRecorder: MediaRecorder | null = null;
  let recordedObjectURL: string | null = null;
  let recordedBlob: Blob;

  let isRecording: boolean = false;

  onMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		
		mediaRecorder = new MediaRecorder(stream);
		mediaRecorder.ondataavailable = (e) => media.push(e.data)
		mediaRecorder.onstop = function(){
			try {
        const audio = document.querySelector('audio');
			  recordedBlob = new Blob(media, { type: "audio/webm" });
        recordedObjectURL = window.URL.createObjectURL(recordedBlob);
			  audio.src = recordedObjectURL;
      } catch (err) {
        toast.push('Error occured during recording, try again', { duration: 2000 })
      }
      media = [];
		}
  })

  function startRecording() {
		mediaRecorder.start();
    isRecording = true;
	}

	function stopRecording() {
		mediaRecorder.stop();
    isRecording = false;
	}

  $: recordedBlob && fetchTextFromSpeech(recordedBlob)

  async function fetchTextFromSpeech(recordedBlob: Blob) {
    const formData = new FormData()
    formData.append('model', 'whisper-1')
    formData.append('file', recordedBlob, 'recording.webm')
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV_OBJ.OPENAI_API}`,
      },
      body: formData
    })

    if (res.status === 200) {
      const text = (await res.json()).text;
      textSpeechStore.set(text)
    }
  }
</script>

<div>
  {#if isRecording}
    <button
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
      on:click={stopRecording}
    >
      Stop
    </button>
  {/if}

  {#if !isRecording}
    <button 
      class="bg-white-500 border-red-500 bg-white rounded-md border-2 hover:bg-red-700 hover:text-white hover:bg-red-700 text-red-500 font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
      on:click={startRecording}
    >Record
    </button>
  {/if}
</div>