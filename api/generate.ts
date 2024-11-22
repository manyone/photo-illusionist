import * as fal from "@fal-ai/serverless-client";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image_url, prompt } = req.body;

    fal.config({
      credentials: process.env.FAL_KEY,
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

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ message: 'Error generating image' });
  }
}