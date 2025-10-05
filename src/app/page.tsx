import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to dashboard, auth hook will handle redirect to login if needed
  redirect('/dashboard');
}
