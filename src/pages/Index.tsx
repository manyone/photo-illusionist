import { useState, useCallback } from "react";
import * as fal from "@fal-ai/serverless-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageComparison } from "@/components/ImageComparison";
import { LoadingState } from "@/components/LoadingState";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

interface FalResponse {
  seed: number;
  image: {
    url: string;
    width: number;
    height: number;
    file_name: string;
    file_size: number;
    content_type: string;
  };
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setGeneratedImage(null);
      console.log("Image loaded successfully");
    };
    reader.onerror = () => {
      console.error("Error reading file");
      toast({
        title: "Error",
        description: "Failed to load the image",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) {
      toast({
        title: "Missing input",
        description: "Please provide both an image and a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting image generation with params:", {
        image_url: selectedImage,
        prompt,
      });
      
      const result = await fal.run("illusion-diffusion", {
        input: {
          image_url: selectedImage,
          prompt,
          scheduler: "Euler",
          image_size: "square_hd",
          guidance_scale: 12,
          negative_prompt: "(worst quality, poor details:1.4), lowres, (artist name, signature, watermark:1.4), bad-artist-anime, bad_prompt_version2, bad-hands-5, ng_deepnegative_v1_75t",
          num_inference_steps: 40,
          control_guidance_end: 1,
          controlnet_conditioning_scale: 1,
        },
      }) as FalResponse;

      console.log("Generation successful:", result);
      setGeneratedImage(result.image.url);
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "generated-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedImage]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Illusion Diffusion
          </h1>
          <p className="text-muted-foreground">
            Transform your images using AI-powered illusion diffusion
          </p>
        </div>

        <div className="space-y-4">
          <ImageUploader
            onImageSelect={handleImageSelect}
            className="h-[300px]"
          />

          <div className="flex gap-4">
            <Input
              placeholder="Enter your prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt || isLoading}
            >
              Generate
            </Button>
          </div>
        </div>

        {isLoading && (
          <LoadingState className="h-[500px]" />
        )}

        {selectedImage && generatedImage && !isLoading && (
          <div className="space-y-4">
            <ImageComparison
              originalImage={selectedImage}
              generatedImage={generatedImage}
            />
            <div className="flex justify-center">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download Result
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;