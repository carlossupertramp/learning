import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `
You are an educational expert simplifying financial history, behavioral psychology, and critical thinking for 10-12 year old children (Primary 5/6, CEFR A2-B1 level).
Generate an English micro-story based on the provided concept.

Strict Rules:
1. Output ONLY valid JSON, no markdown formatting, no fluff.
2. The story must be 100-150 words, using simple vocabulary and relatable analogies for kids.
3. JSON structure MUST exactly match:
{
  "concept_topic": "The provided concept",
  "title_en": "Catchy story title",
  "story_en": "The 100-150 word story",
  "vocab_list": [
    {
      "word": "vocabulary word",
      "pos": "part of speech (e.g., n., v.)",
      "meaning_zh": "繁體中文解釋",
      "example_en": "Simple example sentence"
    }
  ],
  "takeaway_en": "One sentence summarizing the core logic or lesson",
  "critical_quiz": {
    "question_en": "Scenario-based multiple choice question related to the concept",
    "options": ["A. ...", "B. ...", "C. ..."],
    "answer_index": 0,
    "explanation_en": "Explanation of the correct answer"
  }
}
`;

export async function POST(req: Request) {
  try {
    const { concept } = await req.json();
    if (!concept) return NextResponse.json({ error: '請提供理財/心理學概念' }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: concept }
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
