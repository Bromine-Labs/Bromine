declare global {
	// so uh this is transport interface guys mindblowing technology
	interface TransportOptions {
		epoxy: string;
		libcurl: string;
	}
	type Transport = keyof TransportOptions;

	interface Window {
		$scramjetLoadController: () => { ScramjetController: any };
		tabs: Tab[];
		scramjet: any;
	}
}

export { };
