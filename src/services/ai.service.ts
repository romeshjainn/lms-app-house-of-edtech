import { OPENAI_KEY } from '@/constants/env';

type AiPayload = {
  title: string;
  description: string;
  type?: 'course' | 'question';
};

export const askAssistant = async ({ title, description, type = 'question' }: AiPayload) => {
  let userPrompt = '';

  if (type === 'course') {
    userPrompt = `
Course Title: ${title}
Course Description: ${description}

Please analyze this course briefly and explain:
- What the course is about
- Who it is best for
Keep the response short (2-3 sentences).
`;
  } else {
    userPrompt = `
User Question Title: ${title}
Question Details: ${description}

Answer clearly and briefly in 2-3 short sentences.
`;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful LMS assistant. Always respond in a concise and helpful manner.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.5,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.log(data);
    throw new Error(data.error?.message || 'AI error');
  }

  return data.choices[0].message.content.trim();
};
