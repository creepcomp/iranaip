import { redirect } from 'next/navigation';
import OldBrowser from '../OldBrowser';

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path;
    if (path.length === 0) redirect('/old');
    return <OldBrowser path={path.join('/')} />;
};