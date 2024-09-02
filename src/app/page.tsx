import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('@/components/Canvas'), {
  ssr: false,
  loading: () => <p>Loading Canvas...</p>
});

export default function Home() {
  return (
    <main>
      <Canvas />
    </main>
  );
}