import * as fal from "@fal-ai/serverless-client";

export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { image_url, prompt } = body;

    console.log("Starting image generation with params:", { prompt });

    fal.config({
      credentials: process.env.VITE_FAL_KEY,
    });

    const result = await fal.run("illusion-diffusion", {
      input: {
        image_url,
        prompt,
        scheduler: "Euler",
        image_size: "square_hd",
        guidance_scale: 12,
        negative_prompt: "(worst quality, poor details:1.4), lowres, (artist name, signature, watermark:1.4), bad-artist-anime, bad_prompt_version2, bad-hands-5, ng_deepnegative_v1_75t",
        num_inference_steps: 40,
        control_guidance_end: 1,
        controlnet_conditioning_scale: 1,
      },
    });

    console.log("Generation successful:", result);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error("Generation failed:", error);
    return new Response(JSON.stringify({ 
      message: error instanceof Error ? error.message : 'Failed to generate image' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}