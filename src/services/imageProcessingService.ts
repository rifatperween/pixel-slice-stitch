import { supabase } from '@/lib/supabase';

export interface ProcessingOptions {
  rows: number;
  cols: number;
  key: string;
}

export const uploadImage = async (file: File) => {
  console.log('Uploading image:', { fileName: file.name, fileSize: file.size });
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }
  
  console.log('Upload successful:', data);
  return data;
};

export const processImage = async (imageUrl: string, options: ProcessingOptions) => {
  console.log('Processing image:', { imageUrl, options });
  
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
};