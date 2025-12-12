import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function IngestPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Data ingest</h1>
				<p className="text-muted-foreground">Send CSVs or payloads into Supabase/Postgres.</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Upload sample</CardTitle>
					<CardDescription>Wire this form to a Supabase storage bucket and pipeline.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="dataset-name">
							Dataset name
						</label>
						<Input id="dataset-name" placeholder="Downtime events - Dec" />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="ingest-notes">
							Notes
						</label>
						<Textarea id="ingest-notes" placeholder="Context, schema, target table..." rows={4} />
					</div>
					<Button disabled>Upload coming soon</Button>
				</CardContent>
			</Card>
		</div>
	);
}

