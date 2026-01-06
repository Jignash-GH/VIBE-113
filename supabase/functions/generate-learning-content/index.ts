// @ts-nocheck - Deno edge function, types are available at runtime
// @deno-types="https://esm.sh/@supabase/supabase-js@2.57.4"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ConceptRequest {
  concept_name?: string;
  generate_initial?: boolean;
  // New optional fields for direct control
  topic?: string;
  language?: string;
  skill_level?: 'spoonfeeder' | 'structured';
}

// Spoonfeeder Content Generator - Detailed explanations for beginners
function spoonfeederPrompt(topic: string, language: string) {
  return `
You are teaching "${topic}" in ${language} to a complete beginner. Provide a comprehensive, detailed explanation that covers EVERY aspect and sub-topic.

CRITICAL REQUIREMENTS - Cover ALL sub-topics:

If topic is "Basic Operators" or "Operators":
- Assignment operators: =, +=, -=, *=, /=, %=
- Arithmetic operators: +, -, *, /, %, ** (exponentiation)
- Comparison operators: ==, !=, ===, !==, <, >, <=, >=
- Logical operators: && (AND), || (OR), ! (NOT)
- Increment/Decrement: ++, --
- For EACH operator: definition, how it works, example code, line-by-line explanation

If topic is "Conditional Statements" or "if-else":
- if statement: what it is, syntax, how it works, example
- else statement: what it is, when to use, example
- else if statement: what it is, when to use, example
- Nested if statements: what they are, how they work, example
- Switch statements: what they are, when to use, example
- Ternary operator: what it is, syntax, example
- For EACH: definition, syntax, example code, step-by-step walkthrough

If topic is "Loops" or "Loops (for, while)":
- for loop: what it is, syntax, how it works, example with walkthrough
- while loop: what it is, syntax, how it works, example with walkthrough
- do-while loop: what it is, difference from while, example
- forEach loop: what it is, when to use, example
- Nested loops: what they are, example
- Loop control: break and continue statements
- For EACH: definition, syntax, example code, line-by-line explanation

If topic is "Variables and Data Types":
- What variables are and why we use them
- Variable declaration and initialization
- ALL data types: integers, floats/doubles, strings, booleans, arrays, objects, null, undefined
- For EACH data type: what it stores, example, when to use
- Variable naming rules and best practices

If topic is "Functions Basics":
- What functions are and why we use them
- Function declaration and definition
- Function parameters and arguments
- Return statements
- Function calls
- Local vs global scope
- Examples for each concept

If topic is "Arrays Introduction":
- What arrays are and why we need them
- Array declaration and initialization in different ways
- Accessing array elements (indexing)
- Array properties: length, size
- Array methods: push, pop, shift, unshift, splice, slice
- Array iteration: for loop, forEach, map, filter, reduce
- Multi-dimensional arrays
- Common array operations: searching, sorting
- For EACH method: what it does, example, explanation
- Real-life examples of when to use arrays

If topic is "Linked Lists":
- What linked lists are and how they differ from arrays
- Node structure: data and next pointer
- Types of linked lists: singly, doubly, circular
- Basic operations: insertion, deletion, traversal
- Creating a linked list
- Advantages and disadvantages vs arrays
- When to use linked lists
- Code examples for each operation
- Step-by-step walkthrough of operations

If topic is "Object-Oriented Programming" or "OOP Concepts":
- What OOP is and why it matters
- Classes and Objects: definition and relationship
- Encapsulation: what it is, why important, example
- Inheritance: what it is, types, example
- Polymorphism: what it is, method overloading, overriding, example
- Abstraction: what it is, abstract classes, interfaces, example
- OOP principles: SOLID basics
- Real-world examples for each concept
- Code examples demonstrating each concept

If topic is "String Manipulation":
- What strings are
- String creation
- String concatenation
- String methods: length, charAt, substring, indexOf, replace, toUpperCase, toLowerCase, split, etc.
- For EACH method: what it does, example, explanation

WRITING STYLE FOR BEGINNERS:
- Use simple, everyday language
- Write in clear, single-line sentences
- Explain every technical term the first time you use it
- Use analogies from real life when helpful
- Break everything into small, easy-to-understand pieces
- Use "you" to make it personal and friendly

STRUCTURE:
1. Start with: "What is [topic]? [Simple explanation in 2-3 sentences]"
2. Then systematically cover EVERY sub-topic listed above
3. For each sub-topic:
   - Heading: "1. [Sub-topic name]"
   - Definition: "A [sub-topic] is..."
   - How it works: "When you use [sub-topic], it..."
   - Example code block
   - Explanation: "In this example, line 1 does..., line 2 does..."
   - When to use: "You use [sub-topic] when..."
4. Include a "Common Mistakes" section at the end
5. End with a simple practice suggestion

IMPORTANT: Do NOT write generic text like "Learn about X in programming." Write actual, detailed explanations. Cover EVERY sub-topic mentioned above. Make it comprehensive and educational.

Now write the complete explanation:
`;
}

// Structured Coder Content Generator - Concise but comprehensive for advanced learners
function structuredPrompt(topic: string, language: string) {
  return `
You are teaching "${topic}" in ${language} to an experienced programmer. Provide a concise but comprehensive explanation covering ALL sub-topics.

CRITICAL REQUIREMENTS - Cover ALL sub-topics:

If topic is "Basic Operators" or "Operators":
- Assignment operators: =, +=, -=, *=, /=, %=
- Arithmetic operators: +, -, *, /, %, **
- Comparison operators: ==, !=, ===, !==, <, >, <=, >=
- Logical operators: &&, ||, !
- Increment/Decrement: ++, --
- Bitwise operators (if applicable)
- For EACH: definition, behavior, example, use case, edge cases

If topic is "Conditional Statements" or "if-else":
- if statement: syntax, behavior, example
- else statement: when to use, example
- else if statement: pattern, example
- Nested conditionals: structure, example
- Switch statements: syntax, when to use vs if-else, example
- Ternary operator: syntax, use cases, example
- For EACH: definition, syntax, example, best practices, gotchas

If topic is "Loops" or "Loops (for, while)":
- for loop: syntax, iteration pattern, example
- while loop: syntax, condition evaluation, example
- do-while loop: syntax, difference from while, example
- forEach loop: syntax, when to use, example
- Nested loops: structure, complexity, example
- Loop control: break and continue, examples
- For EACH: definition, syntax, example, time complexity, use cases

If topic is "Variables and Data Types":
- Variable declaration and scoping
- ALL data types: primitives (int, float, string, bool) and complex (arrays, objects)
- Type coercion and type checking
- For EACH data type: characteristics, example, use cases

If topic is "Functions Basics":
- Function declaration vs expression
- Parameters and arguments
- Return values and void functions
- Scope and closures
- Higher-order functions
- Examples for each concept

If topic is "Arrays Introduction":
- Array creation and initialization patterns
- Array access and manipulation techniques
- Essential methods: push, pop, shift, unshift, slice, splice, map, filter, reduce, find, sort
- Time complexity analysis for array operations
- Memory layout and cache performance
- Multi-dimensional arrays and jagged arrays
- Array vs other data structures comparison
- For EACH method: purpose, syntax, example, time complexity, use cases

If topic is "Linked Lists":
- Node structure and pointer management
- Types: singly, doubly, circular linked lists
- Core operations: insert, delete, search, traverse
- Implementation details and edge cases
- Time and space complexity analysis
- Advantages/disadvantages vs arrays
- Use cases and real-world applications
- Advanced operations: reversal, cycle detection

If topic is "Object-Oriented Programming" or "OOP Concepts":
- Class design and object instantiation
- Encapsulation: data hiding and getters/setters
- Inheritance: single, multiple, multilevel, hierarchical
- Polymorphism: compile-time (overloading) vs runtime (overriding)
- Abstraction: abstract classes, interfaces, pure virtual functions
- SOLID principles detailed explanation
- Design patterns: Singleton, Factory, Observer, Strategy
- Composition vs inheritance
- Memory management and object lifecycle

If topic is "String Manipulation":
- String immutability
- Essential methods: length, charAt, substring, indexOf, replace, toUpperCase, toLowerCase, split, join, etc.
- For EACH method: purpose, syntax, example, use cases

If topic is "Advanced Arrays and Memory Management":
- Memory layout and cache performance considerations
- Dynamic arrays vs static arrays
- Array resizing strategies and amortized analysis
- Multi-dimensional arrays: row-major vs column-major
- Sparse arrays and memory optimization
- Array-based data structures: stacks, queues, heaps
- Memory fragmentation and garbage collection
- Performance optimization techniques

If topic is "Linked Lists Implementation":
- Node structure and memory management
- Singly linked list: implementation and operations
- Doubly linked list: implementation and trade-offs
- Circular linked lists: use cases and implementation
- Linked list variations: skip lists, XOR linked lists
- Memory leak prevention in linked lists
- Iterator patterns for linked lists
- Comparison with array-based structures

If topic is "Advanced Object-Oriented Programming":
- Deep dive into inheritance: virtual functions, vtables
- Multiple inheritance: diamond problem, virtual inheritance
- Run-time type information (RTTI) and dynamic casting
- Exception handling and RAII patterns
- Template metaprogramming concepts
- Memory management: smart pointers, GC integration
- Object pooling and flyweight patterns
- Reflection and introspection capabilities

WRITING STYLE FOR ADVANCED LEARNERS:
- Be concise but complete - no step-by-step handholding
- Use technical terminology appropriately
- Focus on "what", "why", and "when" - not detailed "how"
- Assume familiarity with programming fundamentals
- Get straight to the point
- Include performance considerations

STRUCTURE:
1. Brief overview: "[Topic] is... [Purpose in 1-2 sentences]"
2. Systematically cover EVERY sub-topic
3. For each sub-topic:
   - Heading: "1. [Sub-topic name]"
   - Definition: One clear sentence
   - Characteristics: Key behaviors and properties
   - Example: Clean, idiomatic code
   - Use cases: When and why to use it
   - Gotchas/Edge cases: Important considerations
4. Best practices section
5. Performance considerations (if applicable)

IMPORTANT: Do NOT write generic text. Write actual, comprehensive explanations. Cover EVERY sub-topic. Be efficient with words but complete in coverage.

Now write the complete explanation:
`;
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
  'Linked Lists',
  'Object-Oriented Programming Basics',
];

const advancedConcepts = [
  'Advanced Arrays and Memory Management',
  'Linked Lists Implementation',
  'Algorithm Complexity (Big O)',
  'Recursion and Backtracking',
  'Dynamic Programming',
  'Graph Algorithms',
  'Sorting and Searching Algorithms',
  'Advanced Object-Oriented Programming',
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

    // If caller supplies a skill_level, honor it; otherwise infer from profile.learning_level
    const requestedSkill = requestData.skill_level;
    const isSpoonfeeder = requestedSkill
      ? requestedSkill === 'spoonfeeder'
      : profile.learning_level === 'spoonfeeder';
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

      // Get API key from environment, with fallback for testing
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyDtVZ9cQLkLT0vO6nYiRURDyqhyt1YW8CM';
      const conceptsToInsert: Array<{
        user_id: string;
        concept_name: string;
        concept_description: string;
        difficulty_level: string;
        order_index: number;
        is_completed: boolean;
      }> = [];

      for (let i = 0; i < conceptList.length; i++) {
        const conceptName = conceptList[i];
        let description = `Comprehensive guide to ${conceptName}. Click to view detailed explanation.`;

        if (geminiApiKey) {
          const lang = requestData.language ?? 'programming';
          const prompt = (requestedSkill ?? (isSpoonfeeder ? 'spoonfeeder' : 'structured')) === 'spoonfeeder'
            ? spoonfeederPrompt(conceptName, lang)
            : structuredPrompt(conceptName, lang);

          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                  },
                }),
              }
            );

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (generatedText && generatedText.trim().length > 50) {
                description = generatedText.trim();
              }
            } else {
              const errorData = await geminiResponse.json().catch(() => ({}));
              console.error(`Gemini API error for ${conceptName}:`, errorData);
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

    // Support either concept_name (existing) or topic (new)
    const singleConceptName = requestData.concept_name ?? requestData.topic;
    if (singleConceptName) {
      // Get API key from environment, with fallback for testing
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyDtVZ9cQLkLT0vO6nYiRURDyqhyt1YW8CM';
      let description = `Comprehensive guide to ${singleConceptName}. Generating detailed explanation...`;

      if (geminiApiKey) {
        const lang = requestData.language ?? 'programming';
        const prompt = (requestedSkill ?? (isSpoonfeeder ? 'spoonfeeder' : 'structured')) === 'spoonfeeder'
          ? spoonfeederPrompt(singleConceptName, lang)
          : structuredPrompt(singleConceptName, lang);

        try {
          // Use the correct Gemini API endpoint
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
          
          const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
            }),
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (generatedText && generatedText.trim().length > 50) {
              description = generatedText.trim();
            } else {
              console.error('Gemini API returned empty or short text:', geminiData);
              description = `Detailed explanation for ${singleConceptName}. Please try again.`;
            }
          } else {
            const errorData = await geminiResponse.json().catch(() => ({}));
            console.error('Gemini API error:', {
              status: geminiResponse.status,
              statusText: geminiResponse.statusText,
              error: errorData
            });
            description = `Unable to generate detailed explanation for ${singleConceptName} at this time. Please try again later.`;
          }
        } catch (error) {
          console.error('Error generating description:', error);
          description = `Error generating content for ${singleConceptName}. Please try again.`;
        }
      }

      // Check if concept already exists for this user
      const { data: existingConcept } = await supabaseClient
        .from('learning_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('concept_name', singleConceptName)
        .maybeSingle();

      if (existingConcept) {
        // Update existing concept with new description
        const { error: updateError } = await supabaseClient
          .from('learning_progress')
          .update({
            concept_description: description,
            difficulty_level: difficultyLevel,
          })
          .eq('id', existingConcept.id);

        if (updateError) {
          throw updateError;
        }

        // Ensure description is always included in response
        const responseData = {
          success: true,
          message: 'Concept explanation updated',
          description: description || `Comprehensive guide to ${singleConceptName}` 
        };
        
        console.log('Returning response with description length:', responseData.description.length);
        
        return new Response(
          JSON.stringify(responseData),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        // Insert new concept
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
            concept_name: singleConceptName,
            concept_description: description,
            difficulty_level: difficultyLevel,
            order_index: newOrderIndex,
            is_completed: false,
          });

        if (insertError) {
          throw insertError;
        }

        // Ensure description is always included in response
        const responseData = {
          success: true,
          message: 'Concept added to learning path',
          description: description || `Comprehensive guide to ${singleConceptName}` 
        };
        
        console.log('Returning response with description length:', responseData.description.length);
        
        return new Response(
          JSON.stringify(responseData),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
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