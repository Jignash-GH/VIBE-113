import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface QuizData {
  coding_level_score: number;
  coding_proficiency_score: number;
  decision_making_score: number;
  cgpa: number;
  real_life_application_score: number;
}

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

    const quizData: QuizData = await req.json();

    const totalScore =
      quizData.coding_level_score +
      quizData.coding_proficiency_score +
      quizData.decision_making_score +
      (quizData.cgpa / 10) * 3 + // Normalize CGPA (1-10) to 0-3 scale
      quizData.real_life_application_score;

    // Normalize to percentage (max: 3+3+3+3+3 = 15)
    const maxScore = 15;
    const percent = Math.max(0, Math.min(100, (totalScore / maxScore) * 100));
    
    // Better categorization logic
    let category: string;
    if (percent <= 30) {
      category = 'spoonfeeder'; // Beginner - needs structured guidance
    } else if (percent <= 60) {
      category = 'spoonfeeder'; // Still needs structured approach
    } else {
      category = 'well-idea'; // Advanced - can work independently
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    let analysisText = '';

    if (geminiApiKey) {
      const prompt = `Analyze this coding assessment quiz result and provide personalized learning recommendations.

Quiz Scores:
- Coding Level: ${quizData.coding_level_score}/3
- Coding Proficiency: ${quizData.coding_proficiency_score}/3
- Decision Making: ${quizData.decision_making_score}/3
- CGPA: ${quizData.cgpa}/10
- Real Life Application: ${quizData.real_life_application_score}/3

Total Score: ${totalScore.toFixed(2)}
Category: ${category}

Provide a brief (2-3 sentences) personalized learning path recommendation for this student.`;

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
        analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis completed successfully.';
      }
    }

    const { error: insertError } = await supabaseClient.from('quiz_results').insert({
      user_id: user.id,
      coding_level_score: quizData.coding_level_score,
      coding_proficiency_score: quizData.coding_proficiency_score,
      decision_making_score: quizData.decision_making_score,
      cgpa: quizData.cgpa,
      real_life_application_score: quizData.real_life_application_score,
      total_score: totalScore,
      category,
    });

    if (insertError) {
      throw insertError;
    }

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ learning_level: category })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        category,
        total_score: totalScore,
        analysis: analysisText,
        percent,
        // Added for simpler client consumption
        score: percent,
        skill_level: category,
      }),
      {
        status: 200,
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