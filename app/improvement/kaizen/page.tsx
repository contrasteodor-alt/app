import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function KaizenPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Kaizen board</h1>
				<p className="text-muted-foreground">Capture improvement ideas and track actions.</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Ideas</CardTitle>
						<CardDescription>Start simple with mocked content. Replace with Supabase tables.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>• Reduce changeover time on Line A by standardizing tooling.</p>
						<p>• Add auto-flag for scrap spikes with AI notifications.</p>
						<p>• Trial new packaging workflow to cut manual touches.</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Submit new idea</CardTitle>
						<CardDescription>Store this in Supabase with ownership and status.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Textarea placeholder="Describe the improvement idea..." rows={5} />
						<Button>Save idea</Button>
						<p className="text-xs text-muted-foreground">
							TODO: map this form to a Postgres table with RLS.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}







