import OpenAI from "openai";
import type ChatCompletionsAPI from "openai";

const MODEL = "gpt-4o";

const openai: OpenAI = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
  organization: process.env.OPENAI_ORGANIZATION_ID,
});

const stylingGuidelines = `
**Art Style Guidelines:**
- The illustrations should have a whimsical and imaginative feel, with bright and cheerful colors.
- The style should be hand-drawn and slightly cartoonish, with soft edges and gentle shading.
- Characters and settings should be drawn with soft, rounded lines and vibrant colors.
- Ensure a consistent design for all characters, with expressive features and a slightly cartoonish appearance to appeal to young readers.
- Maintain a rich and varied color palette that complements the natural setting. For forest scenes, use greens, browns, and golds; for water scenes, use blues and greens, etc.
- All illustrations should match these guidelines to ensure a cohesive and harmonious visual style throughout the story.
- Make sure no text is drawn in the image.
`;

export function imagePrompt(firstImage: boolean, story: string, backStory?: string) {
  let prompt = stylingGuidelines;

  if (firstImage) {
    prompt += `This is the first image in the series so there isn't a backstory.`;
  } else {
    prompt += `Previous backstory: ${backStory}`;
  }

  prompt += `With these art style guidelines and backstory in mind if there is one, please illustrate the following: ${story}`;

  return prompt;
}

export async function createImagePrompt(firstImage: boolean, story: string, backStory?: string, pastPrompt?: string) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are an assistant that helps generate consistent and cohesive prompts for creating children's book illustrations. Your job is to ensure that illustrations are drawn in the same style, with characters and settings looking the same across multiple scenes."
    },
    {
      role: "user",
      content: firstImage 
        ? `This is the first image in the series. This prompt will help define extremely strict artistic and stylistic guidelines for future prompts to adhere to.\n\n${stylingGuidelines}` 
        : `Previous backstory: ${backStory}\n\nHere is the most recent prompt you generated: "${pastPrompt}".\n\nPlease ensure that the new prompt helps generate an illustration consistent with the style and details of the last prompt. The artistic elements should remain as close to the same as possible.`
    },
    {
      role: "user",
      content: `Current story section: ${story}\nPlease generate a detailed and consistent prompt for an illustration based on the story section provided. The new illustration should match the style, character appearances, and color palette of the previous illustrations, ensuring it looks like it was made by the same artist.`
    }
  ];

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: messages,
    temperature: 0.2,
  });

  const generatedPrompt = response.choices[0].message.content;
  //console.log(generatedPrompt);
  return generatedPrompt;
}

export async function createImageCompletion(prompt: string) {
  const imageRequest: any = {
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  };

  const response = await openai.images.generate(imageRequest);

  const image_url = response.data[0].url;

  return image_url;
}

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
