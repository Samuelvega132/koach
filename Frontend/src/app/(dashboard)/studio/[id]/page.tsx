import { api } from '@/services/api';
import { StudioClient } from '@/components/stage/StudioClient';
import { notFound } from 'next/navigation';

interface PageProps {
    params: {
        id: string;
    };
}

// Force dynamic because we need fresh song data
export const dynamic = 'force-dynamic';

export default async function StudioPage({ params }: PageProps) {
    const song = await api.getSongById(params.id);

    if (!song) {
        notFound();
    }

    return <StudioClient song={song} />;
}
