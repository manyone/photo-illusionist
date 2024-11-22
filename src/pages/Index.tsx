import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageComparison } from "@/components/ImageComparison";
import { LoadingState } from "@/components/LoadingState";
import { useToast } from "@/components/ui/use-toast";
import { Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

interface FalInput {
  image_url: string;
  prompt: string;
  scheduler: string;
  image_size: string;
  guidance_scale: number;
  negative_prompt: string;
  num_inference_steps: number;
  control_guidance_end: number;
  controlnet_conditioning_scale: number;
}

interface FalResponse {
  image: {
    url: string;
  };
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setGeneratedImage(null);
      setError(null);
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
    setError(null);
    
    try {
      console.log("Starting image generation with params:", {
        image_url: selectedImage,
        prompt,
      });

      const input: FalInput = {
        image_url: selectedImage,
        prompt,
        scheduler: "Euler",
        image_size: "square_hd",
        guidance_scale: 12,
        negative_prompt: "(worst quality, poor details:1.4), lowres, (artist name, signature, watermark:1.4), bad-artist-anime, bad_prompt_version2, bad-hands-5, ng_deepnegative_v1_75t",
        num_inference_steps: 40,
        control_guidance_end: 1,
        controlnet_conditioning_scale: 1,
      };

      const result = await fal.run<FalInput, FalResponse>("110602490-illusion-diffusion", {
        input,
      });

      if (!result || !result.image || !result.image.url) {
        throw new Error('Invalid response from API');
      }

      console.log("Generation successful:", result);
      setGeneratedImage(result.image.url);
    } catch (error) {
      console.error("Generation failed:", error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'There was an error generating your image',
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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