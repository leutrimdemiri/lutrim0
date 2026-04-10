<script lang="ts">
	import { showSearch } from "./CommandPaletteStore";
</script>

<button
	type="button"
	class="search-button group flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-none bg-transparent outline-none md:h-10 md:w-auto md:max-w-[360px] md:min-w-[210px] md:justify-start md:border md:border-(--border) md:bg-surface-tonal-a10 md:px-3"
	aria-keyshortcuts="Control+K Meta+K"
	on:click={() => {
		$showSearch = true;
	}}
>
	<div class="sr-only">search</div>
	<!-- Icon -->
	<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="absolute md:static">
		<path
			d="M21.71 20.29 18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a.999.999 0 0 0 1.42 0 1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
		></path>
	</svg>

	<!-- Placeholder (desktop only) -->
	<span class="ml-3 hidden font-sans text-sm opacity-60 md:inline"> Search… </span>

	<!-- KBD (desktop only) -->
	<div class="ml-auto hidden items-center gap-1 md:flex">
		<kbd class="bg-primary-a10 rounded px-1.5 py-0.5 font-sans text-xs text-text-a0"> Ctrl+K </kbd>
		<kbd class="bg-primary-a10 rounded px-1.5 py-0.5 font-sans text-xs text-text-a0"> ⌘ K </kbd>
	</div>
</button>

<noscript>
	<style>
		.search-button {
			display: none;
		}
	</style>
</noscript>
