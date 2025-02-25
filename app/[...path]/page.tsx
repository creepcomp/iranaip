import { redirect } from 'next/navigation';
import Main from '../Main';

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
    const path = (await params).path;
    if (path.length === 0) redirect('/');
    return <Main path={path.join('/')} />;
};