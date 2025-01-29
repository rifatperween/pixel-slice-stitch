import { supabase } from '@/lib/supabase';

export interface ProcessingOptions {
  rows: number;
  cols: number;
  key: string;
}

export const uploadImage = async (file: File) => {
  console.log('Starting upload process:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  // Sanitize the filename to remove any problematic characters
  const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, '');
  const fileName = `${Date.now()}-${sanitizedName}`;

  try {
    // Check if file size is within limits (< 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }

    // Verify file type
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/i)) {
      throw new Error('Only JPEG and PNG files are allowed');
    }

    console.log('Uploading file to Supabase storage:', fileName);
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);
    return data;
  } catch (error) {
    console.error('Upload process error:', error);
    throw error;
  }
};

export const processImage = async (imageUrl: string, options: ProcessingOptions) => {
  console.log('Processing image:', { imageUrl, options });
  
  try {
    const { data, error } = await supabase.functions.invoke('process-image', {
      body: {
        imageUrl,
        options,
      },
    });

    if (error) {
      console.error('Processing error:', error);
      throw error;
    }

    console.log('Processing successful:', data);
    return data;
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  }
};