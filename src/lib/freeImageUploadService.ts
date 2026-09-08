/**
 * Free Image Upload Service using Cloudinary / ImageKit / ImgBB.
 * Allows uploading raw image files directly from client side
 * completely FREE without paying for Firebase Storage.
 */

// Default Cloudinary unsigned preset (or can be configured with user's own cloud name)
const CLOUDINARY_CLOUD_NAME = 'finalstop-barbershop';
const CLOUDINARY_UPLOAD_PRESET = 'barbershop_gallery';

/**
 * Uploads an image file to a free CDN (ImgBB free direct API / Cloudinary / Base64 compressed fallback).
 * Zero cost, unlimited free storage tier.
 */
export async function uploadImageToFreeCloud(file: File): Promise<string> {
  // Option 1: Try ImgBB Free API (Instant direct image URL without login needed)
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Free public ImgBB API key for seamless direct uploads
    const res = await fetch('https://api.imgbb.com/1/upload?key=81c5d00a06ef89b7eb9a5525916327e0', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.url) {
        return data.data.url;
      }
    }
  } catch (err) {
    console.warn('ImgBB free API attempt failed, trying Cloudinary or high-efficiency WebP/Base64:', err);
  }

  // Option 2: Try Cloudinary unsigned upload if configured
  try {
    const cloudName = (typeof window !== 'undefined' && localStorage.getItem('CLOUDINARY_CLOUD_NAME')) || CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (typeof window !== 'undefined' && localStorage.getItem('CLOUDINARY_UPLOAD_PRESET')) || CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      const cldFormData = new FormData();
      cldFormData.append('file', file);
      cldFormData.append('upload_preset', uploadPreset);

      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cldFormData
      });

      if (cldRes.ok) {
        const cldData = await cldRes.json();
        if (cldData?.secure_url) {
          return cldData.secure_url;
        }
      }
    }
  } catch (cldErr) {
    console.warn('Cloudinary upload skipped or failed:', cldErr);
  }

  // Option 3: Local Canvas Compression (100% Free, zero external dependency, saves directly into Firestore)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1080; // Crisp high-res max width/height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Clean high quality WebP/JPEG compression
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
