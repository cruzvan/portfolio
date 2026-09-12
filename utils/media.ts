/**
 * Shared media helpers so every view treats videos the same way.
 */

export const isVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

/**
 * Builds a lightweight still-frame poster for Cloudinary-hosted videos.
 * Returns undefined for non-Cloudinary URLs or when the URL shape is unknown.
 *
 * Cloudinary video URL shape:
 *   https://res.cloudinary.com/<cloud>/video/upload/<version>/<publicId>.webm
 * Poster URL shape:
 *   https://res.cloudinary.com/<cloud>/video/upload/so_0,f_jpg,q_auto,w_800/<version>/<publicId>.jpg
 */
export const getVideoPoster = (url: string): string | undefined => {
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return undefined;
  }

  const withTransform = url.replace(
    '/video/upload/',
    '/video/upload/so_0,f_jpg,q_auto,w_800/'
  );

  return withVideoExtension(withTransform, '.jpg');
};

const withVideoExtension = (url: string, newExtension: string): string | undefined => {
  const replaced = url.replace(/\.(mp4|webm|ogg|mov)(\?.*)?$/i, newExtension);
  return replaced === url ? undefined : replaced;
};
