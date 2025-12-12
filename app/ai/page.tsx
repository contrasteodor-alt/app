import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function AIPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">AI assistant</h1>
				<p className="text-muted-foreground">Ask questions about your operations data.</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Prompt</CardTitle>
					<CardDescription>Route this to your preferred model with Supabase RLS checks.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea placeholder="e.g. Summarize downtime by line for the last 24h." rows={4} />
					<Button>Ask AI</Button>
					<p className="text-xs text-muted-foreground">
						Integrate Supabase functions or Edge runtime to execute and stream answers.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}






