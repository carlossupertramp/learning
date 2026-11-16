import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `
你是一位嚴格的高小中文科專家。你的任務是將提供的繁體中文生字，拆解成字形部件，並提供廣東話解釋及一句記憶密碼。

強制規則：
1. 絕對只輸出純 JSON 格式，不要包含任何 markdown 標記（如 \`\`\`json）、開場白或結語。
2. JSON 結構必須完全依照以下格式：
{
  "word": "生字",
  "explanation_yue": "廣東話解釋（小學生能懂的）",
  "example_sentence": "包含該生字的繁體中文例句",
  "lego_structure": [
    {"position": "部件位置(如：上、下、左、右、外、內)", "part": "字形部件"}
  ],
  "memory_code": "一句搞笑且有助於記憶結構的密碼"
}

範例：
輸入："努"
輸出：
{
  "word": "努",
  "explanation_yue": "即係出盡全力去做一件事",
  "example_sentence": "哥哥每日都努力溫習，希望考試攞滿分。",
  "lego_structure": [
    {"position": "上", "part": "奴"},
    {"position": "下", "part": "力"}
  ],
  "memory_code": "奴隸出盡力做嘢"
}
`;

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word) {
      return NextResponse.json({ error: '請提供生字' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: word }
      ],
      response_format: { type: "json_object" },
    });

    const aiContent = completion.choices[0].message.content;
    if (!aiContent) throw new Error('AI 未回傳內容');
    
    // 解析 JSON 確保格式正確
    const parsedData = JSON.parse(aiContent);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: '生成失敗' }, { status: 500 });
  }
}
