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
  credentials: "YOUR_FAL_KEY", // Replace with your fal.ai API key
});

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

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
      const result = await fal.run("illusion-diffusion", {
        input: {
          image_url: selectedImage,
          prompt,
          guidance_scale: 12,
        },
      });

      setGeneratedImage(result.images[0].url);
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