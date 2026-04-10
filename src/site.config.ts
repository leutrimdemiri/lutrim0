import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Leutrim Demiri",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-GB",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// Used as the default description meta property and webmanifest description
	description: "My personal blog about web development, programming, and technology.",
	// HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
	lang: "en-GB",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_GB",
	/* 
		- Used to construct the meta title property found in src/components/BaseHead.astro L:11 
		- The webmanifest name found in astro.config.ts L:42
		- The link value found in src/components/layout/Header.astro L:35
		- In the footer found in src/components/layout/Footer.astro L:12
	*/
	title: "luetrim.dev",
	// ! Please remember to replace the following site property with your own domain, used in astro.config.ts
	url: "http://localhost:1234/",
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "Home",
	},
	{
		path: "/about/",
		title: "About",
	},
	{
		path: "/posts/",
		title: "Blog",
	},
	{
		path: "/notes/",
		title: "Notes",
	},
];
// if true, will enable the search functionality
export const SEARCH_ENABLED = true;

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderColor: 'var(--border)',
		borderWidth: '1px',
		borderRadius: '8px',
		codeBackground: 'var(--code-bg)',
		codeFontSize: '0.83rem',
		frames: {
			editorActiveTabForeground: 'var(--color-global-text)',
			editorActiveTabBackground: 'transparent',
			editorActiveTabIndicatorBottomColor: 'transparent',
			editorActiveTabIndicatorTopColor: 'transparent',
			editorTabBorderRadius: '0',
			editorBackground: 'var(--code-bg)',
			editorTabBarBackground: 'transparent',
			editorTabBarBorderBottomColor: 'transparent',
			frameBoxShadowCssValue: 'none',
			inlineButtonBorder: 'transparent',
			terminalBackground: 'var(--code-bg)',
			terminalTitlebarBackground: 'transparent',
			terminalTitlebarBorderBottomColor: 'transparent',
			terminalTitlebarForeground: 'transparent',
			terminalTitlebarDotsForeground: 'var(--border)',
			terminalTitlebarDotsOpacity: '100%',
		},
		textMarkers: {
			markBackground: 'color-mix(in oklab, var(--color-accent) 5%, transparent)',
			markBorderColor: 'color-mix(in oklab, var(--color-accent) 25%, transparent)',
		},
	},
	themeCssSelector(theme, { styleVariants }) {
		// If one dark and one light theme are available
		// generate theme CSS selectors compatible with cactus-theme dark mode switch
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		// return default selector
		return `[data-theme="${theme.name}"]`;
	},
	// One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
	themes: ["gruvbox-dark-hard", "gruvbox-light-hard"],
	useThemedScrollbars: false,
};
