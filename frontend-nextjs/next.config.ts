import type { NextConfig } from 'next';
import { IMAGE_HOSTS } from './services/imageHosts';

const nextConfig: NextConfig = {
  images: {
    // Solo se optimizan dominios conocidos, para no crear un proxy abierto de imágenes
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: 'https' as const, hostname })),
  },
};

export default nextConfig;
