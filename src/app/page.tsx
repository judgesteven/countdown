import Countdown from '@/components/Countdown';

export const metadata = {
  title: 'Countdown App',
  description: 'Countdown to July 7th, 2:00 AM',
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Countdown />
    </main>
  );
}
