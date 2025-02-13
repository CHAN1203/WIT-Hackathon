const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

if (!PERPLEXITY_API_KEY) {
  throw new Error("Missing PERPLEXITY_API_KEY environment variable")
}

export async function getChatResponse(message: string, context?: any) {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are Zaneta, an AI learning assistant that helps users learn programming. You provide clear, concise explanations and guide users through their learning journey.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        context: context,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from Perplexity API")
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error calling Perplexity API:", error)
    throw error
  }
}

