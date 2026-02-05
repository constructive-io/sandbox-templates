export default function HelpPage() {
	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mx-auto max-w-4xl'>
				<h1 className='text-foreground mb-6 text-3xl font-bold'>Help Center</h1>
				<div className='prose prose-neutral dark:prose-invert max-w-none'>
					<p className='text-muted-foreground mb-8 text-lg'>
						Welcome to the Constructive Help Center. Find answers to your questions and learn how to make the most of Constructive
						platform.
					</p>

					<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
						<div className='border-border/60 rounded-lg border p-6'>
							<h3 className='mb-3 text-xl font-semibold'>Getting Started</h3>
							<p className='text-muted-foreground'>
								Learn the basics of Constructive and how to set up your first project.
							</p>
						</div>

						<div className='border-border/60 rounded-lg border p-6'>
							<h3 className='mb-3 text-xl font-semibold'>API Documentation</h3>
							<p className='text-muted-foreground'>Comprehensive documentation for our GraphQL API and endpoints.</p>
						</div>

						<div className='border-border/60 rounded-lg border p-6'>
							<h3 className='mb-3 text-xl font-semibold'>Troubleshooting</h3>
							<p className='text-muted-foreground'>
								Common issues and their solutions to help you resolve problems quickly.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
