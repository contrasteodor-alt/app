import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Navbar } from '@/components/navbar';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900'
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900'
});

export const metadata: Metadata = {
	title: 'CoMo Lean AI',
	description: 'Factory operations insights, AI and continuous improvement'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<div className="flex min-h-screen flex-col">
					<Navbar />
					<main className="flex-1 bg-muted/20">
						<div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
					</main>
				</div>
			</body>
		</html>
	);
}
