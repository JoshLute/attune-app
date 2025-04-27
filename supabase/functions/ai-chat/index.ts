
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    console.log("Sending request to OpenAI API with message:", message)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.5-preview',
        messages: [
          {
            role: 'system',
            content: "You are an AI teaching assistant helping educators understand student behavior and learning patterns. You provide insights about student engagement, suggest teaching strategies, and help interpret student data. Keep responses concise and focused on educational insights."
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API Error:", response.status, errorData)
      throw new Error(`OpenAI API responded with status ${response.status}: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log("Received response from OpenAI API")
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected response format:", data)
      throw new Error("Invalid response format from OpenAI API")
    }
    
    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
