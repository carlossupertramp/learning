import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert Singapore Math teacher for Primary 5 and 6 students. 
Generate a math word problem based on the provided topic.

Strict Rules:
1. Output ONLY valid JSON, no markdown formatting (e.g. no \`\`\`json), no introductory text.
2. The problem must be in English.
3. Break down the solution into logical steps (Bar Model logic). 
4. Every calculation step MUST include a unit label in the explanation.
5. JSON structure MUST exactly match:
{
  "topic": "The exact topic provided",
  "question_en": "The math word problem",
  "steps": [
    {
      "step_number": 1,
      "calculation": "e.g., 15 / 3 = 5",
      "unit_label": "e.g., 5 apples",
      "hint_1": "Basic hint for the student asking what to find first",
      "hint_2": "Stronger hint with explicit math operation instructions"
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: '請提供知識點' }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: topic }
      ],
      response_format: { type: "json_object" },
    });

    const aiContent = completion.choices[0].message.content;
    if (!aiContent) throw new Error('AI 未回傳內容');
    
    return NextResponse.json(JSON.parse(aiContent));
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: '生成失敗' }, { status: 500 });
  }
}
