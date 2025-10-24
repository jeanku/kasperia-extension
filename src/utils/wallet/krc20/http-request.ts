export class HttpRequest {
  public readonly baseUrl?: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl;
  }

  get = async <TRes>(url: string): Promise<TRes> => {
    try {
      let _url = `${this.baseUrl ?? ''}${url}`
      console.log("url:", _url)
      const res = await fetch(`${this.baseUrl ?? ''}${url}`, {
        method: 'GET'
      });
      return (await res.json()) as TRes;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}
