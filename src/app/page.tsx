import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to login page as the new entry point
  redirect('/login');
}
