import { supabase } from '@/lib/supabase';

export interface ProcessingOptions {
  rows: number;
  cols: number;
  key: string;
}

export const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) throw error;
  return data;
};

export const processImage = async (imageUrl: string, options: ProcessingOptions) => {
  const { data, error } = await supabase.functions.invoke('process-image', {
    body: {
      imageUrl,
      options,
    },
  });

  if (error) throw error;
  return data;
};