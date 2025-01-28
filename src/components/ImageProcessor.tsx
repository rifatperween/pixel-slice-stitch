import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, Lock, Unlock, Grid, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "./ui/alert";
import { uploadImage, processImage, ProcessingOptions } from '@/services/imageProcessingService';

interface ProcessingState {
  isUploading: boolean;
  isSegmenting: boolean;
  isEncrypting: boolean;
  isDecrypting: boolean;
  isStitching: boolean;
}

interface ImageSegment {
  data: string;
  index: number;
  encrypted?: boolean;
  decrypted?: boolean;
}

const ImageProcessor = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [segments, setSegments] = useState<ImageSegment[]>([]);
  const [key, setKey] = useState<string>('');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isUploading: false,
    isSegmenting: false,
    isEncrypting: false,
    isDecrypting: false,
    isStitching: false,
  });

  const segmentImage = async (imageUrl: string): Promise<ImageSegment[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const segmentWidth = img.width / cols;
        const segmentHeight = img.height / rows;
        const segments: ImageSegment[] = [];

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const segCanvas = document.createElement('canvas');
            const segCtx = segCanvas.getContext('2d');
            if (!segCtx) continue;

            segCanvas.width = segmentWidth;
            segCanvas.height = segmentHeight;

            segCtx.drawImage(
              img,
              j * segmentWidth,
              i * segmentHeight,
              segmentWidth,
              segmentHeight,
              0,
              0,
              segmentWidth,
              segmentHeight
            );

            segments.push({
              data: segCanvas.toDataURL(),
              index: i * cols + j,
            });
          }
        }
        resolve(segments);
      };
      img.src = imageUrl;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    console.log('Starting upload process:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    setProcessing(prev => ({ ...prev, isUploading: true }));
    setStatusMessage('Uploading image...');
    
    try {
      const uploadResult = await uploadImage(file);
      const imageUrl = supabase.storage
        .from('images')
        .getPublicUrl(uploadResult.path).data.publicUrl;
      
      setImage(imageUrl);
      toast.success('Image uploaded successfully');
      setStatusMessage('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
      setStatusMessage('Upload failed');
    } finally {
      setProcessing(prev => ({ ...prev, isUploading: false }));
    }
  }, []);

  const processImageWithBackend = async () => {
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, isSegmenting: true }));
      setStatusMessage('Processing image with advanced algorithms...');

      const options: ProcessingOptions = {
        rows,
        cols,
        key,
      };

      const result = await processImage(image, options);
      
      setProcessedImage(result.processedImageUrl);
      setSegments(result.segments);
      
      toast.success('Image processed successfully');
      setStatusMessage('Processing complete!');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Error processing image');
      setStatusMessage('Processing failed');
    } finally {
      setProcessing({
        isUploading: false,
        isSegmenting: false,
        isEncrypting: false,
        isDecrypting: false,
        isStitching: false,
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Image Processor</h1>
      
      {statusMessage && (
        <Alert className="mb-4">
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Supports JPG, JPEG, PNG</p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Encryption Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter encryption key"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rows</label>
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Columns</label>
                <input
                  type="number"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <button
              onClick={processImageWithBackend}
              disabled={!image || Object.values(processing).some(Boolean)}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process Image
            </button>
          </div>

          {/* Processing Status */}
          <div className="space-y-2">
            <StatusStep
              icon={<Grid className="h-5 w-5" />}
              label="Segmenting"
              isActive={processing.isSegmenting}
            />
            <StatusStep
              icon={<Lock className="h-5 w-5" />}
              label="Encrypting"
              isActive={processing.isEncrypting}
            />
            <StatusStep
              icon={<Unlock className="h-5 w-5" />}
              label="Decrypting"
              isActive={processing.isDecrypting}
            />
            <StatusStep
              icon={<Layers className="h-5 w-5" />}
              label="Stitching"
              isActive={processing.isStitching}
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Original Image</h3>
            {image ? (
              <img src={image} alt="Original" className="w-full rounded-md" />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">No image uploaded</p>
              </div>
            )}
          </div>

          {/* Segments Display */}
          {segments.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Image Segments</h3>
              <div 
                className="grid gap-2" 
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`
                }}
              >
                {segments.map((segment, idx) => (
                  <div 
                    key={idx} 
                    className={`relative border rounded-md overflow-hidden
                      ${segment.encrypted ? 'bg-red-100' : ''}
                      ${segment.decrypted ? 'bg-green-100' : ''}
                    `}
                  >
                    <img 
                      src={segment.data} 
                      alt={`Segment ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {segment.encrypted && !segment.decrypted && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock className="text-white h-6 w-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Processed Image</h3>
            {processedImage ? (
              <img src={processedImage} alt="Processed" className="w-full rounded-md" />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">No processed image yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusStep = ({ icon, label, isActive }: { icon: React.ReactNode; label: string; isActive: boolean }) => (
  <div className={`flex items-center space-x-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
    {isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
    <span>{label}</span>
  </div>
);

export default ImageProcessor;
