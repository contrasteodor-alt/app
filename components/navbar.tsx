'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { OrgSwitcher } from '@/components/org-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
	{ href: '/select-org', label: 'Organizations' },
	{ href: '/ingest', label: 'Ingest' },
	{ href: '/action-plan', label: 'Action Plan' },
	{ href: '/ai', label: 'AI' },
	{ href: '/improvement/kaizen', label: 'Kaizen' }
];

function NavItems({ onClick }: { onClick?: () => void }) {
	const pathname = usePathname();

	return (
		<div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
			{navLinks.map((item) => {
				const active = pathname === item.href || pathname?.startsWith(item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						onClick={onClick}
						className={`text-sm font-medium transition hover:text-primary ${
							active ? 'text-primary' : 'text-muted-foreground'
						}`}
					>
						{item.label}
					</Link>
				);
			})}
		</div>
	);
}

function UserActions() {
	const pathname = usePathname();
	const isLogin = pathname === '/login';

	return (
		<div className="flex items-center gap-3">
			<Link href="/login">
				<Button variant={isLogin ? 'default' : 'outline'} size="sm">
					{isLogin ? 'Logging in' : 'Login'}
				</Button>
			</Link>
		</div>
	);
}

export function Navbar() {
	return (
		<header className="border-b bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
				<div className="flex items-center gap-3">
					<Link href="/" className="text-base font-semibold">
						CoMo Lean AI
					</Link>
					<Separator orientation="vertical" className="hidden h-6 md:block" />
					<div className="hidden items-center gap-4 md:flex">
						<OrgSwitcher />
						<Separator orientation="vertical" className="h-6" />
						<NavItems />
					</div>
				</div>
				<div className="hidden md:block">
					<UserActions />
				</div>
				<div className="md:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Open menu">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="flex flex-col gap-6">
							<OrgSwitcher />
							<NavItems />
							<UserActions />
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}

