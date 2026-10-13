import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Resizes and compresses an image in the browser before uploading it to Firebase Storage.
 * Returns the public download URL and the uploaded object path.
 */
export async function optimizeAndUploadImage(
  file: File,
  folder: string,
  maxWidth = 1200,
  quality = 0.85
): Promise<{ url: string; path: string }> {
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

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '') || 'image';
    const path = `${folder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${safeName}.webp`;
    const objectRef = ref(storage, path);
    await uploadBytes(objectRef, optimizedBlob, { contentType: 'image/webp' });
    const url = await getDownloadURL(objectRef);
    return { url, path };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
