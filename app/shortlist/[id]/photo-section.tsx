import { loadCandidatePhotos } from "@/lib/photos";
import { PhotoGallery } from "./photo-gallery";

// Galeri foto — di-stream via <Suspense>. `loadCandidatePhotos` membuat signed URL batch
// (jaringan ke Storage) yang dulu memblok render; kini scaffold tampil lebih dulu.
export async function PhotoSection({ candidateId }: { candidateId: string }) {
  const photos = await loadCandidatePhotos(candidateId);
  return <PhotoGallery candidateId={candidateId} photos={[...photos.listing, ...photos.survey]} />;
}
