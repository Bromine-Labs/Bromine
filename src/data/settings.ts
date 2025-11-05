const FILTER_OPTIMIZE_ON = import.meta.env.PUBLIC_FILTER_OPTIMIZE === "true";

function optimize(text: string) {
	if (FILTER_OPTIMIZE_ON) {
		text = text.replace("o", "σ");
		text = text.replace("u", "ú")
	}
	return text;
}

export const settingsData = {
	sections: [
		{
			title: "General",
			settings: [
				{
					id: "bromine_theme",
					label: "Theme",
					type: "select",
					defaultValue: "mocha",
					description: "It's simple. Make this website look different",
					options: [
						{ label: "Catppuccin", disabled: true },
						{ value: "mocha", label: "Mocha" },
						{ value: "macchiato", label: "Macchiato" },
						{ value: "frappe", label: "Frappe" },
						{ value: "latte", label: "Latte" },
						{ label: "Rosé Pine", disabled: true },
						{ value: "main", label: "Rosé Pine" },
						{ value: "moon", label: "Moon" },
						{ value: "dawn", label: "Dawn" },
						{ label: "Other", disabled: true },
						{ value: "amoled", label: "Amoled Dark" },
					],
				},
				{
					id: "bromine_search_engine",
					label: "Default Search Engine",
					type: "select",
					defaultValue: "https://search.brave.com/search?q=%s",
					description:
						"Choose the search engine used when you search from the address bar.",
					options: [
						{ value: "https://search.brave.com/search?q=%s", label: "Brave" },
						{ value: "https://www.bing.com/search?q=%s", label: "Bing" },
						{
							value: "https://duckduckgo.com/?q=%s&ia=web",
							label: "Duckduckgo",
						},
						{ value: "https://search.yahoo.com/search?p=%s", label: "Yahoo" },
						{ value: "https://searx.si/search?q=%s", label: "SearXNG" },
						{ value: "https://www.qwant.com/?q=%s", label: "Qwant" },
						{ value: "https://www.ecosia.org/search?q=%s", label: "Ecosia" },
						{ value: "https://yandex.com/search?text=%s", label: "Yandex" },
					],
				},
				{
					id: "bromine_anti_close",
					label: "Anti Close",
					type: "toggle",
					defaultValue: "off",
					description:
						"Stops the bromine tabs from being closed. This can either be a good thing or a bad thing.",
				},
			],
		},
		{
			title: optimize("Cloaking"),
			settings: [
				{
					id: "bromine_stealth_mode",
					label: optimize("Stealth Mσde"),
					type: "toggle",
					defaultValue: "on",
					description:
						"This will hide all your activity from even browser back/forward arrows!",
				},
				{
					id: "bromine_about_blank",
					label: optimize("About Blank"),
					type: "toggle",
					defaultValue: "false",
					description: `${optimize("About blanks")} the ${optimize("proxy")}. Hides the ${optimize("proxy")} from history but not back/forward buttons.`,
				},
				{
					id: "bromine_cloak",
					label: optimize("Cloaking"),
					type: "select",
					defaultValue: "bromine|favicon.ico",
					description:
						"Disguises the tabs with a different title and favicon to hide your activity.",
					options: [
						{ value: "bromine|favicon.ico", label: "Default/None" },
						{
							value: "Google|https://www.google.com/favicon.ico",
							label: "Google",
						},
						{
							value:
								"ABC News - Breaking News, Latest News and Videos|https://abcnews.go.com/favicon.ico",
							label: "ABC News",
						},
						{
							value: "Home|https://ssl.gstatic.com/classroom/favicon.png",
							label: "Google Classroom",
						},
						{
							value: "PowerSchool|https://www.powerschool.com/favicon.ico",
							label: "PowerSchool",
						},
						{
							value:
								"Wikipedia|https://www.wikipedia.org/static/favicon/wikipedia.ico",
							label: "Wikipedia",
						},
						{
							value:
								"Dashboard|https://canvas-student.net/images/uploads/2022-10-19/favicon-cdxtk.ico",
							label: "Canvas",
						},
						{ value: "IXL|https://www.ixl.com/favicon.ico", label: "IXL" },
						{
							value:
								"The New York Times - Breaking News, US News, World News and Video|https://static01.nyt.com/favicon.ico",
							label: "NY Times",
						},
					],
				},
			],
		},
		{
			title: optimize("Proxy"),
			settings: [
				{
					id: "bromine_transport",
					label: optimize("Proxy Transport"),
					type: "select",
					defaultValue: "libcurl",
					description: `This is basically a TLS layer communication. ${optimize("Epoxy")} is faster but libcurl supports more websites.`,
					options: [
						{ value: "epoxy", label: optimize("Epoxy") },
						{ value: "libcurl", label: optimize("Libcurl") },
					],
				},
				{
					id: "bromine_wisp",
					label: "Wisp Server",
					type: "text",
					defaultValue: "wss://anura.pro/",
					placeholder: "wss://wisp.pro/",
					description:
						"The transport server used. This requires a '/' at the end",
				},
			],
		},
	],
};
