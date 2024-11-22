import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface ImageComparisonProps {
  originalImage: string;
  generatedImage: string;
}

export const ImageComparison = ({ originalImage, generatedImage }: ImageComparisonProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
      <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={originalImage} alt="Original" />}
        itemTwo={<ReactCompareSliderImage src={generatedImage} alt="Generated" />}
        className="h-[500px] object-cover"
      />
    </div>
  );
};