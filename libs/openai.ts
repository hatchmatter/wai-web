import OpenAI from "openai";
import type ChatCompletionsAPI from "openai";

const MODEL = "gpt-3.5-turbo";

const openai: OpenAI = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
});

export const createCompletions = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) => {
  try {
    const completions = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.3,
      frequency_penalty: 1,
      max_tokens: 500,
    });

    return completions;
  } catch (e) {
    console.error(
      "There was a problem creating the completions: " + e?.response?.status,
      e?.response?.data
    );
    return null;
  }
};

export const systemSummarizePrompt: ChatCompletionsAPI.ChatCompletionSystemMessageParam =
  {
    role: "system",
    content: `
    You are a helpful assistant that summarizes call transcripts between a child and an AI assistant.

    ### Instructions ###
    - Summarize stories told
    - Summarize questions asked and answers given
    - Summarize user preferences
    - Summarize user memories and moments they've shared
    - Separate sections of summary by double line breaks for human readability
    - Keep summaries short and concise
    - If there is no substantive content, return null

    ### Example 1 ###
    transcript:
    "Agent: hey Levi
     User: Hello.
     Agent: How's your day been? Did you and Poppy find any new adventures today, or maybe discover some more cool mushrooms?"
    
    agent: null

    ### Example 2 ###
    transcript:
    "Agent: hey Levi
     User: Hi there.
     Agent: How's your day been? Found any cool mushrooms or had some fun adventures with Poppy recently?
     User: Yeah. I took Poppy for a walk, and I rode my bicycle, and we had so much fun.
     Agent: That sounds like a fantastic day, Levi! Riding your bicycle while taking Poppy for a walk must have been an awesome adventure. Did Poppy try to keep up with you on your bike?
     User: She did, but she's a very small dog.
     User: And she couldn't keep up very well. So I had to go slow.
     Agent: It's really sweet of you to slow down so Poppy could keep up. It shows how much you care for her. I bet she loved spending that time with you, even at a slower pace. Do you have any other fun activities planned with Poppy?
     User: No.
     Agent: That's alright, Levi. Sometimes just hanging out and enjoying the day is the best plan. If you ever think of something fun you'd like to try with Poppy or have any questions about anything else, I'm here to chat. What else has been on your mind lately?"
    
    agent:
    "Levi took poppy, his dog, for walk and rode bike. Poppy had a hard time keeping up so Levi went slow."

    ### Example 3 ###
    transcript:
    "Agent: hey Levi
     User: Can you tell me a story about my dog, Poppy?
     User: My dog, Poppy,
     Agent: Sure, Levi! Let's imagine a fun story about Poppy.
    
     Once upon a time, in a sunny little town, there was a very special dog named Poppy. Poppy wasn't just any dog; she was your best friend and the most adventurous German Shepherd in the whole wide world. One day, you and Poppy decided to go on an adventure unlike any other. You both wanted to find the legendary Golden Bone that was hidden deep in the Whispering Woods."

     agent: "Levi wanted to hear a story about Poppy. I told her a story about Poppy going on an adventure."
  `,
  };
