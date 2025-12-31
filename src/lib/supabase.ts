import { createClient } from "@supabase/supabase-js";

// Supabase client using publishable (anon) key
// This works for both client-side and server-side with proper RLS policies
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

/**
 * Upload a text file to Supabase Storage
 * @param bucket - The storage bucket name (e.g., 'ad-copy')
 * @param path - The file path in the bucket
 * @param content - The text content to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadTextToStorage(
  bucket: string,
  path: string,
  content: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, content, {
      contentType: "text/plain",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Upload JSON data to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path in the bucket
 * @param data - The JSON data to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadJsonToStorage(
  bucket: string,
  path: string,
  data: any
): Promise<string> {
  const content = JSON.stringify(data, null, 2);

  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(path, content, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

  return publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path in the bucket
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete from storage: ${error.message}`);
  }
}
