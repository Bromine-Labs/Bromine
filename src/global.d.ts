declare global {

  interface Window {
    __uv$config: any;
    $scramjetLoadController: () => { ScramjetController: any };
  }


  // so uh this is transport interface guys mindblowing technology
  interface TransportOptions {
    epoxy: string;
    libcurl: string;
  }
  type Transport = keyof TransportOptions;
}

export { };
