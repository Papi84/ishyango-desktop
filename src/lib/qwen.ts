const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY
const QWEN_API_URL = 'https://dashscope.aliyun.com/compatible-mode/v1/chat/completions'

export interface AIInsight {
  summary: string
  concepts: string[]
  tags: string[]
}

export async function extractInsights(text: string, context?: string): Promise<AIInsight> {
  const prompt = `Analyze this text and extract:
1. A brief summary (2-3 sentences)
2. Key concepts (3-5 bullet points)
3. Relevant tags (5-10 keywords)

Text: "${text}"

${context ? `Context: ${context}` : ''}

Respond in JSON format:
{
  "summary": "...",
  "concepts": ["...", "..."],
  "tags": ["...", "..."]
}`

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an educational AI assistant that extracts insights from academic texts. Respond ONLY with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch (err) {
    console.error('Failed to parse AI response:', err)
    return {
      summary: content,
      concepts: [],
      tags: []
    }
  }
}
