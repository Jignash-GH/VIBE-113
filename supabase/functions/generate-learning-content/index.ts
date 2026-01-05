import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ConceptRequest {
  concept_name?: string;
  generate_initial?: boolean;
}

const beginnerConcepts = [
  'Variables and Data Types',
  'Basic Operators',
  'Conditional Statements (if-else)',
  'Loops (for, while)',
  'Functions Basics',
  'Arrays Introduction',
  'String Manipulation',
  'Basic Input/Output',
];

const advancedConcepts = [
  'Data Structures (Linked Lists, Trees)',
  'Algorithm Complexity (Big O)',
  'Recursion and Backtracking',
  'Dynamic Programming',
  'Graph Algorithms',
  'Sorting and Searching Algorithms',
  'Object-Oriented Programming',
  'Design Patterns',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: ConceptRequest = await req.json();

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('learning_level')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !profile.learning_level) {
      return new Response(
        JSON.stringify({ error: 'Please complete the quiz first' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isSpoonfeeder = profile.learning_level === 'spoonfeeder';
    const difficultyLevel = isSpoonfeeder ? 'beginner' : 'advanced';
    const conceptList = isSpoonfeeder ? beginnerConcepts : advancedConcepts;

    if (requestData.generate_initial) {
      const { data: existingProgress } = await supabaseClient
        .from('learning_progress')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingProgress && existingProgress.length > 0) {
        return new Response(
          JSON.stringify({ message: 'Initial content already generated' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      const conceptsToInsert = [];

      for (let i = 0; i < conceptList.length; i++) {
        const conceptName = conceptList[i];
        let description = `Learn about ${conceptName} in programming.`;

        if (geminiApiKey) {
          const prompt = `Explain the programming concept "${conceptName}" for a ${isSpoonfeeder ? 'beginner who needs detailed explanations' : 'intermediate programmer who understands basics'}. Provide a clear, concise explanation in 2-3 sentences with a simple example.`;

          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                }),
              }
            );

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || description;
            }
          } catch (error) {
            console.error(`Error generating description for ${conceptName}:`, error);
          }
        }

        conceptsToInsert.push({
          user_id: user.id,
          concept_name: conceptName,
          concept_description: description,
          difficulty_level: difficultyLevel,
          order_index: i,
          is_completed: false,
        });
      }

      const { error: insertError } = await supabaseClient
        .from('learning_progress')
        .insert(conceptsToInsert);

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Learning content generated' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (requestData.concept_name) {
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      let description = `Learn about ${requestData.concept_name} in programming.`;

      if (geminiApiKey) {
        const prompt = `Explain the programming concept "${requestData.concept_name}" for a ${isSpoonfeeder ? 'beginner who needs detailed explanations' : 'intermediate programmer who understands basics'}. Provide a clear, concise explanation in 2-3 sentences with a simple example.`;

        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || description;
          }
        } catch (error) {
          console.error('Error generating description:', error);
        }
      }

      const { data: maxOrder } = await supabaseClient
        .from('learning_progress')
        .select('order_index')
        .eq('user_id', user.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

      const { error: insertError } = await supabaseClient
        .from('learning_progress')
        .insert({
          user_id: user.id,
          concept_name: requestData.concept_name,
          concept_description: description,
          difficulty_level: difficultyLevel,
          order_index: newOrderIndex,
          is_completed: false,
        });

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Concept added to learning path' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});