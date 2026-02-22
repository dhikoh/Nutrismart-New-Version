import { redirect } from 'next/navigation';

export default function Home() {
  // Directly redirect to the app dashboard for now.
  // In the future, this might redirect to a landing page or /auth/login based on session.
  redirect('/app');
}
