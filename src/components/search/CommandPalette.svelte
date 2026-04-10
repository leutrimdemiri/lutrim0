<script lang="ts">
	import { onMount } from "svelte";
	import { fade, scale, slide } from "svelte/transition";
	import { showSearch } from "./CommandPaletteStore";

	type PagefindResultData = {
		excerpt: string;
		url: string;
		meta: {
			title: string;
		};
		sub_results?: Array<{
			title?: string;
			url?: string;
			excerpt?: string;
		}>;
	};

	type PagefindSearchResult = {
		data: () => Promise<PagefindResultData>;
	};

	type PagefindSearchResponse = {
		results: PagefindSearchResult[];
	};

	type PagefindModule = {
		search?: (term: string) => Promise<PagefindSearchResponse | null>;
		debouncedSearch: (term: string) => Promise<PagefindSearchResponse | null>;
		preload?: () => Promise<void>;
	};

	type SearchResultItem = {
		title: string;
		content: string;
		href: string;
		kind: "page" | "heading";
	};

	export let showResults = true;

	export let placeholder = "What are you searching for?";

	export let results: SearchResultItem[] = [
		{
			title: "Title",
			content:
				"This is some longer content that will probably have to be cut at some point, because it just wont fit but such is life, what can you do? nothing. i mean i guess you could scroll? but that would look ugly",
			href: "/",
			kind: "page",
		},
		{ title: "Title", content: "Content", href: "/", kind: "heading" },
	];

	export let noResults = "No results found";

	let currentSelection = -1;
	let searchToken = 0;
	let resultItems: Array<HTMLAnchorElement | undefined> = [];
	const resultCache = new Map<string, SearchResultItem[]>();
	const MAX_RESULTS = 10;
	const MAX_CACHE_ENTRIES = 30;
	const formatExcerpt = (excerpt: string) =>
		excerpt
			.replaceAll("<mark>", '<span class="bg-accent/20 rounded-xs px-0.5 py-0">')
			.replaceAll("</mark>", "</span>");
	const closeSearch = () => {
		$showSearch = false;
	};
	const moveSelection = (direction: 1 | -1) => {
		if (results.length === 0) return;
		if (currentSelection === -1) {
			currentSelection = direction === 1 ? 0 : results.length - 1;
			return;
		}
		currentSelection = (currentSelection + direction + results.length) % results.length;
	};
	const navigateToSelection = () => {
		if (value.trim() === "") {
			closeSearch();
			return;
		}
		if (currentSelection >= 0 && currentSelection < results.length) {
			const href = results[currentSelection]?.href;
			closeSearch();
			if (href) window.location.assign(href);
			return;
		}
		closeSearch();
	};
	const handleSearchNavigationKeys = (event: KeyboardEvent) => {
		if (!$showSearch) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			moveSelection(1);
			return;
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			moveSelection(-1);
			return;
		}
		if (event.key === "Tab") {
			event.preventDefault();
			moveSelection(event.shiftKey ? -1 : 1);
			return;
		}
		if (event.key === "Enter") {
			event.preventDefault();
			navigateToSelection();
		}
	};

	let search = async () => {
		const term = value.trim();
		if (term == "") return;
		if (!pagefind) return;
		const token = ++searchToken;
		const cachedResults = resultCache.get(term);
		if (cachedResults) {
			showResults = true;
			results = cachedResults;
			return;
		}

		const search =
			(typeof pagefind.search === "function"
				? await pagefind.search(term)
				: await pagefind.debouncedSearch(term)) ?? null;
		if (!search) {
			results = [];
			showResults = true;
			return;
		}
		if (token !== searchToken) return;

		showResults = true;

		const newResults: SearchResultItem[] = [];
		const pageResults = search.results.slice(0, MAX_RESULTS);
		const pageData = await Promise.all(
			pageResults.map(async (searchResult) => {
				try {
					return (await searchResult?.data()) ?? null;
				} catch {
					return null;
				}
			}),
		);

		for (let i = 0; i < pageData.length && newResults.length < MAX_RESULTS; i++) {
			const result = pageData[i];
			if (!result) continue;

			const pageExcerpt = formatExcerpt(result.excerpt || "");
			const pageTitle = result.meta?.title || "Untitled";

			newResults.push({
				title: pageTitle,
				content: pageExcerpt,
				href: result.url,
				kind: "page",
			});

			const subResults = result.sub_results || [];
			for (let j = 0; j < subResults.length && newResults.length < MAX_RESULTS; j++) {
				const sub = subResults[j];
				if (!sub?.url || !sub.url.includes("#")) continue;

				newResults.push({
					title: sub.title || pageTitle,
					content: formatExcerpt(sub.excerpt || pageExcerpt),
					href: sub.url,
					kind: "heading",
				});
			}
		}

		const mappedResults = newResults.map((item) => ({
			...item,
			kind: item.href.includes("#") ? "heading" : item.kind,
		}));
		if (token !== searchToken) return;

		results = mappedResults;
		resultCache.set(term, mappedResults);
		if (resultCache.size > MAX_CACHE_ENTRIES) {
			const oldest = resultCache.keys().next().value;
			if (oldest) resultCache.delete(oldest);
		}
	};

	export let value: string = "";

	export const show = () => {
		$showSearch = true;
		setTimeout(() => {
			input?.focus();
		}, 100);
	};

	let pagefind: PagefindModule | null = null;
	const isDev = import.meta.env.DEV;
	async function setupSearch() {
		if (isDev) return;
		try {
			const baseUrl =
				((import.meta as any).env?.BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
			pagefind = (await import(
				/* @vite-ignore */ `${baseUrl}/pagefind/pagefind.js`
			)) as PagefindModule;
			await pagefind.preload?.();
		} catch (error) {
			console.error("Pagefind module not found, will retry after build");
		}
	}

	onMount(() => {
		setupSearch();
		const closeOnRouteChange = () => {
			closeSearch();
		};
		document.addEventListener("astro:before-preparation", closeOnRouteChange);
		return () => {
			document.removeEventListener("astro:before-preparation", closeOnRouteChange);
		};
	});

	let input: HTMLInputElement;

	$: if (value.trim() == "") {
		results = [];
		showResults = false;
	} else {
		search();
	}

	$: if ($showSearch) {
		currentSelection = -1;

		setTimeout(() => {
			input?.focus();
		}, 200);
	} else {
		value = "";
	}

	$: if (results.length === 0) {
		currentSelection = -1;
	} else if (currentSelection >= results.length) {
		currentSelection = results.length - 1;
	}

	$: if (currentSelection >= 0 && currentSelection < resultItems.length) {
		resultItems[currentSelection]?.scrollIntoView({ block: "nearest" });
	}

	$: if (resultItems.length !== results.length) {
		resultItems = resultItems.slice(0, results.length);
	}
</script>

<svelte:window
	on:keydown={(event) => {
		// show/hide on cmd/ctrl + k
		if (event.key == "k" && (event.metaKey || event.ctrlKey)) {
			$showSearch = !$showSearch;

			event.preventDefault();
		}

		// close on escape
		if (event.key === "Escape" && $showSearch) {
			$showSearch = false;
		}

		handleSearchNavigationKeys(event);
	}}
/>

{#if $showSearch}
	<div class="relative z-50" role="dialog" aria-modal="true" transition:fade={{ duration: 100 }}>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<button
				on:click={closeSearch}
				class="fixed inset-0 z-0 cursor-default bg-black/25 transition-opacity ease-out duration-75 backdrop-blur-[2px] dark:bg-black/55"
			>
				<div class="sr-only">hide search</div>
			</button>

			<div
				class="z-10 md:relative bg-background-a0 border-surface-tonal-a10 fixed rounded-t-[10px] outline-hidden top-auto bottom-0 left-0 right-0 w-full max-w-full md:left-1/2 md:w-[640px] md:origin-center md:top-[15%] md:-translate-x-1/2 overflow-hidden md:rounded-xl border shadow-lg"
				transition:scale={{ duration: 140, start: 0.97, opacity: 0.35 }}
			>
				{#if isDev}
					<div class="mx-auto p-5 text-center">
						<p>
							Search is only available in production builds. <br />
							Try building and previewing the site to test it out locally.
						</p>
					</div>
				{:else}
				<div class="flex h-full w-full flex-col p-2">
					<div class="flex w-full flex-none items-center gap-2 text-xs">
						<button
							class="border-inset border-accent bg-accent/15 text-accent h-5 cursor-pointer rounded-sm border border-solid px-1 text-xs font-medium"
							tabindex="-1"
							type="button"
							aria-label="Search App Router documentation"
						>
							Blogs
						</button>
						<button
							class="border-inset border-lue-mint bg-lue-mint/20 text-lue-mint h-5 cursor-pointer rounded-sm border border-solid px-1 text-xs font-medium"
							tabindex="-1"
							type="button"
							aria-label="Search Pages Router documentation"
						>
							Notes
						</button>
						<button
							class="bg-background-100 dark-theme:border-gray-200 dark-theme:bg-gray-100 dark-theme:text-gray-900 dark-theme:hover:text-gray-600 text-global-text h-5 cursor-pointer rounded-sm border border-solid border-gray-200 px-1 text-xs font-medium hover:border-gray-200 hover:text-gray-900"
							tabindex="-1"
							type="button"
							aria-label="Search Pages Router documentation"
						>
							Apps
						</button>
					</div>
				</div>
				<div
					class="flex items-center justify-between gap-3 px-4 py-0 border-b border-accent-2/20 focus-within:z-10"
				>
					<input
						type="text"
						class="h-10 w-full bg-transparent text-global-text dark:text-global-text placeholder:text-global-text ring-0 outline-none"
						{placeholder}
						role="combobox"
						aria-expanded="false"
						aria-controls="options"
						bind:value
						bind:this={input}
					/>
					<button
						on:click={closeSearch}
						class="outline-hidden ml-auto h-5 cursor-pointer items-center rounded-sm bg-global-bg border hover:bg-accent-2/10 border-accent-2/20 px-1 py-0 text-xs shadow-xs transition-colors duration-200"
						type="button">ESC</button
					>
				</div>

				<!-- Results, show/hide based on command palette state -->
				{#if showResults && value.trim() != ""}
					<div transition:slide={{ duration: 100 }}>
						{#if results.length > 0}
							<div
								class="scroll-py-2 overflow-y-auto text-md text-neutral-800 dark:text-neutral-200 divide-y divide-black/5 dark:divide-white/5 flex flex-col max-h-[436px]"
							>
								<!-- Active: "bg-indigo-600 text-white" -->
								{#each results as result, i}
									<a
										href={result.href}
										class="w-full {currentSelection === i
											? 'bg-accent-2/5'
											: 'hover:bg-accent-2/5'} select-none px-4 py-2 text-left"
										bind:this={resultItems[i]}
										on:click={closeSearch}
									>
										<div class="font-semibold flex items-center gap-1">
											{#if result.kind === "heading"}
												<svg
													class="h-5 w-5 shrink-0 text-accent"
													viewBox="0 0 20 20"
													fill="currentColor"
													aria-hidden="true"
												>
													<path
														d="M8 3a1 1 0 0 1 1 1v2h2V4a1 1 0 1 1 2 0v2h2a1 1 0 1 1 0 2h-2v4h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9v2a1 1 0 1 1-2 0v-2H5a1 1 0 1 1 0-2h2V8H5a1 1 0 1 1 0-2h2V4a1 1 0 0 1 1-1Zm1 9h2V8H9v4Z"
													/>
												</svg>
											{:else}
												<svg
													class="h-5 w-5 shrink-0 text-neutral-500"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-hidden="true"
													><path
														d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1M8 7v2h8V7zm0 4v2h8v-2zm0 4v2h5v-2z"
													/></svg
												>
											{/if}
											<span>{result.title}</span>
										</div>
										<div class="text-sm mt-2 line-clamp-2">
											{@html result.content}
										</div>
									</a>
								{/each}
							</div>
						{:else}
							<!-- Empty state, show/hide based on command palette state -->
							<p class="p-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
								{noResults}
							</p>
						{/if}
					</div>
				{/if}
				<div class="flex h-full w-full flex-col p-2">
					<div class="flex w-full flex-none items-center gap-2 text-xs">
						<button
							class="text-global-text h-5 cursor-pointer rounded-sm border border-solid border-gray-400 px-1 text-xs font-medium"
							tabindex="-1"
							type="button"
							aria-label="ESC to close modal"
						>
							ESC
						</button>
						to close
						<button
							class="text-global-text h-5 cursor-pointer rounded-sm border border-solid border-gray-400 px-1 text-xs font-medium"
							tabindex="-1"
							type="button"
							aria-label="TAB to navigate"
						>
							TAB
						</button>
						or
						<button
							class="text-global-text h-5 cursor-pointer rounded-sm border border-solid border-gray-400 px-1 text-xs font-medium"
							tabindex="-1"
							type="button"
							aria-label="Arrow up and Down to navigate"
						>
							↑↓
						</button>
						to navigate
					</div>
				</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
