import { permanentRedirect } from 'next/navigation';

export default function LegacyRoutePage() {
  permanentRedirect('/gift-finder');
}
