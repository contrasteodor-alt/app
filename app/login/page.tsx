import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
	return (
		<div className="mx-auto max-w-md space-y-6">
			<div className="space-y-1 text-center">
				<h1 className="text-2xl font-semibold">Welcome back</h1>
				<p className="text-sm text-muted-foreground">Sign in to continue to CoMo Lean AI.</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Supabase Auth</CardTitle>
					<CardDescription>Wire this form to Supabase email/password or magic links.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground" htmlFor="email">
							Email
						</label>
						<Input id="email" type="email" placeholder="you@example.com" />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground" htmlFor="password">
							Password
						</label>
						<Input id="password" type="password" placeholder="••••••••" />
					</div>
					<Button className="w-full">Continue</Button>
					<p className="text-center text-xs text-muted-foreground">
						Need an account?{' '}
						<Link href="/select-org" className="text-primary underline underline-offset-4">
							Request access
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

