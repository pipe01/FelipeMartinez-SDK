import axios from "axios";
import { Book, Chapter, Character, Movie, Quote } from "./models";

type ItemType<T> = T extends (infer TItem)[] ? TItem : T;
type FieldOrRegex<T, Key extends keyof ItemType<T>> = ItemType<T>[Key] extends string ? (ItemType<T>[Key] | RegExp) : ItemType<T>[Key];

const client = axios.create({
    baseURL: "https://the-one-api.dev/v2"
});

type Response<T> = SuccessResponse<T> | FailedResponse;
interface SuccessResponse<T> {
    docs: T[];
    total: number;
    limit: number;
    offset: string;
    page: number;
    pages: number;
}
interface FailedResponse {
    success: false;
    message: string;
}

abstract class ApiRequest<T> {
    protected readonly query = new URLSearchParams();

    constructor(protected path: string) {
    }

    protected async fetch(): Promise<Response<T>> {
        try {
            const resp = await client.get(this.path);

            return resp.data;
        } catch (e) {
            if (axios.isAxiosError(e)) {
                const resp = e.response.data as FailedResponse;
                throw new Error(`Request failed: ${resp.message}`);
            } else {
                throw e;
            }
        }
    }
}

class ApiRequestMany<T> extends ApiRequest<T> {
    limit(n: number): Omit<this, "limit"> {
        this.query.set("limit", String(n));
        return this;
    }

    page(n: number): Omit<this, "page"> {
        this.query.set("page", String(n));
        return this;
    }

    offset(n: number): Omit<this, "offset"> {
        this.query.set("offset", String(n));
        return this;
    }

    sort(field: keyof ItemType<T>, direction: "asc" | "desc"): Omit<this, "sort"> {
        this.query.set("sort", `${String(field)}:${direction}`);
        return this;
    }

    with<TField extends keyof ItemType<T>>(field: TField, op: "in" | "not in", value: (ItemType<T>[TField])[]): this
    with<TField extends keyof ItemType<T>>(field: TField, op: "==" | "!=", value: FieldOrRegex<T, TField>): this
    with<TField extends keyof ItemType<T>>(field: TField, op: ItemType<T>[TField] extends number ? (">" | "<" | ">=" | "<=") : never, value: number): this

    with<TField extends keyof ItemType<T>>(field: TField, op: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not in", value: any): this {
        const fieldStr = String(field);
        const valueStr = String(value);

        switch (op) {
            case "==": // ?{name}={value}
                this.query.set(fieldStr, valueStr);
                break;
            case "!=": // ?{name}!={value}
                this.query.set(fieldStr + "!", valueStr);
                break;

            case ">": // ?{name}>{value}=
            case "<": // ?{name}<{value}=
                this.query.set(`${fieldStr}${op}${valueStr}`, "");
                break;

            case ">=": // ?{name}>={value}
            case "<=": // ?{name}<={value}
                this.query.set(fieldStr + op[0], valueStr);
                break;
        }

        return this;
    }
    // 

    async get(): Promise<T[]> {
        const resp = await this.fetch();
        if ("success" in resp) {
            throw new Error(resp.message);
        }

        return resp.docs;
    }
}

class ApiRequestSingle<T> extends ApiRequest<T> {
    async get(): Promise<T> {
        const resp = await this.fetch();
        if ("success" in resp) {
            throw new Error(resp.message);
        }
        if (resp.docs.length == 0) {
            throw new Error("No items in response");
        }

        return resp.docs[0];
    }
}

export const books = () => new ApiRequestMany<Book>("book");
export const book = (id: string) => new class BookRequest extends ApiRequestSingle<Book> {
    constructor() { super(`book/${id}`) }

    chapters() {
        return new ApiRequestMany<Chapter>(this.path + "/chapter");
    }
};

export const movies = () => new ApiRequestMany<Movie>("movie");
export const movie = (id: string) => new class MovieRequest extends ApiRequestSingle<Movie> {
    constructor() { super(`movie/${id}`) }

    quotes() {
        return new ApiRequestMany<Quote>(this.path + "/quote");
    }
}

export const characters = () => new ApiRequestMany<Character>("character");
export const character = (id: string) => new class CharacterRequest extends ApiRequestSingle<Character> {
    constructor() { super(`character/${id}`) }

    quotes() {
        return new ApiRequestMany<Quote>(this.path + "/quote");
    }
}

export const quotes = () => new ApiRequestMany<Quote>("quote");
export const quote = (id: string) => new ApiRequestSingle<Quote>(`quote/${id}`);

export const chapters = () => new ApiRequestMany<Chapter>("chapter");
export const chapter = (id: string) => new ApiRequestSingle<Chapter>(`chapter/${id}`);

(async function() {
    const gandalf = await characters().with("name", "==", "Gandalf").get();
    console.log(gandalf);
})();