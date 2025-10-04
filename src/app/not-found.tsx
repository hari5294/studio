import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmojiBadgeLogo } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <EmojiBadgeLogo className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold font-headline">404 - Page Not Found</h1>
      <p className="text-muted-foreground">
        Oops! The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
        <Link href="/dashboard">Go back to Dashboard</Link>
      </Button>
    </div>
  )
}
