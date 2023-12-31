import { ENV_OBJ } from "../lib/env";

type PostConversationRequestBody = {
  scenario: string;
  conversation: {
    role: string;
    content: string;
  }[];
};

type ConversationSummaryResponse = {
  conversation_finish: boolean;
  appointment_confirm: boolean;
};

export const postConversation = async (body: PostConversationRequestBody) => {
  const response = await fetch(`${ENV_OBJ.API_ENDPOINT}/conversation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 200) {
    const responseText: string = response.headers.get("X-Message");

    const buffer = await response.arrayBuffer();
    const audioBlob = new Blob([buffer], { type: "audio/wav" });

    const audioBlobObjectURL = window.URL.createObjectURL(audioBlob);
    return {
      responseText,
      audioBlobObjectURL,
    };
  } else {
    return null;
  }
};
