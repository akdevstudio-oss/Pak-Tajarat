/**
 * Resizes and compresses an image in the browser before uploading it to Cloudflare R2.
 * Returns the public download URL and the uploaded object path.
 */
export async function optimizeAndUploadImage(
  file: File,
  folder: string,
  maxWidth = 1200,
  quality = 0.85
): Promise<{ url: string; path: string; size: number; type: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not read the selected image.'));
      img.src = imageUrl;
    });

    const scale = Math.min(1, maxWidth / image.naturalWidth);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image optimization is not supported by this browser.');
    context.drawImage(image, 0, 0, width, height);

    const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Could not compress the selected image.')),
        'image/webp',
        Math.min(1, Math.max(0.1, quality))
      );
    });

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'image/webp', 'X-Media-Folder': folder },
      credentials: 'same-origin',
      body: optimizedBlob
    });
    let result: any = {};
    try { result = await response.json(); } catch {}
    if (!response.ok) throw new Error(result.error || 'Could not upload image to Cloudflare R2.');
    return { url: result.url as string, path: result.key as string, size: optimizedBlob.size, type: optimizedBlob.type };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
