
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, sessionId } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = "https://objlnvvnifkotxctblgd.supabase.co"
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxudnZuaWZrb3R4Y3RibGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzcyNzgsImV4cCI6MjA2MDUxMzI3OH0.9qwOU2_CPeI-DFxyW21hcMz8wljuyg5Mju6dYyKySc0"

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // Fetch context information from Supabase
    const contextResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_session_context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ session_id: sessionId }),
    })

    const contextData = await contextResponse.json()
    console.log('Context data:', contextData)

    // Fetch recent chat history
    const historyResponse = await fetch(
      `${supabaseUrl}/rest/v1/chat_messages?order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    )

    const chatHistory = await historyResponse.json()
    console.log('Chat history:', chatHistory)

    // Construct messages array with context and history
    const messages = [
      {
        role: 'system',
        content: `You are an AI teaching assistant that helps analyze student performance and provide insights. 
        Here is the context about the current session:
        ${JSON.stringify(contextData)}
        
        Focus on understanding levels and attention patterns. If you notice any concerning patterns,
        mention them. Reference specific moments or notes when relevant.`
      },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      }),
    })

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Store the conversation in the database
    await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        content: message,
        role: 'user',
        session_references: sessionId ? [sessionId] : []
      }),
    })

    await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        content: aiResponse,
        role: 'assistant',
        session_references: sessionId ? [sessionId] : []
      }),
    })
    
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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
