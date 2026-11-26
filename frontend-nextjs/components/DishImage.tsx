import Image from 'next/image';
import { IMAGE_HOSTS } from '@/services/imageHosts';

function isOptimizable(src: string) {
  try {
    return IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

export default function DishImage({ src, alt }: { src: string; alt: string }) {
  if (!src) return <div className="image placeholder">Sin imagen</div>;
  return (
    <div className="image">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, 320px"
        unoptimized={!isOptimizable(src)}
      />
    </div>
  );
}
