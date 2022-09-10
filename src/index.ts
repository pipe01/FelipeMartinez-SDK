import axios, { AxiosInstance } from "axios";
import { Book, Chapter, Character, Movie, Quote } from "./models";

export * from "./models"

type ItemType<T> = T extends (infer TItem)[] ? TItem : T;
type FieldOrRegex<T, Key extends keyof ItemType<T>> = ItemType<T>[Key] extends string ? (ItemType<T>[Key] | RegExp) : ItemType<T>[Key];

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

/**
 * Base class for all requests, handles sending request and parsing the response.
 */
abstract class ApiRequest<T> {
    readonly query = new URLSearchParams();

    constructor(public path: string, public client: AxiosInstance) {
    }

    async fetch(): Promise<SuccessResponse<T>> {
        try {
            const resp = await this.client.get(this.path, { params: this.query });

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

/**
 * Base class for requests that return multiple items that can be paged, filtered and sorted.
 */
class ApiRequestMany<T> extends ApiRequest<T> {
    /**
     * Limits the number of items returned.
     * @param n Maximum number of items.
     */
    limit(n: number): Omit<this, "limit"> {
        this.query.set("limit", String(n));
        return this;
    }

    /**
     * Selects which page to return.
     * @param n Page number, starting from 1.
     */
    page(n: number): Omit<this, "page"> {
        this.query.set("page", String(n));
        return this;
    }

    /**
     * Offsets the returned items within a page.
     */
    offset(n: number): Omit<this, "offset"> {
        this.query.set("offset", String(n));
        return this;
    }

    /**
     * Sorts the returned items by a field.
     * @param field The field to sort by.
     * @param direction The direction to sort in.
     */
    sort(field: keyof ItemType<T>, direction: "asc" | "desc" = "asc"): Omit<this, "sort"> {
        this.query.set("sort", `${String(field)}:${direction}`);
        return this;
    }

    withExists<TField extends keyof ItemType<T>>(field: TField): this {
        this.query.set(String(field), "");
        return this;
    }
    withNotExists<TField extends keyof ItemType<T>>(field: TField): this {
        this.query.set("!" + String(field), "");
        return this;
    }

    with<TField extends keyof ItemType<T>>(field: TField, op: "in" | "not in", value: (ItemType<T>[TField])[]): this
    with<TField extends keyof ItemType<T>>(field: TField, op: "==" | "!=", value: FieldOrRegex<T, TField>): this
    with<TField extends keyof ItemType<T>>(field: TField, op: ItemType<T>[TField] extends number ? (">" | "<" | ">=" | "<=") : never, value: number): this

    with<TField extends keyof ItemType<T>>(field: TField, op: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not in", value: any): this {
        const fieldStr = String(field);
        const valueStr = Array.isArray(value) ? value.join(",") : String(value);

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

    /**
     * Gets a single page of items.
     */
    async get(): Promise<T[]> {
        const { docs } = await this.fetch();

        return docs;
    }

    /**
     * Gets all of the available items, fetching more pages if necessary.
     */
    async getAll(): Promise<T[]> {
        const items: T[] = [];
        let query = this;

        while (true) {
            const resp = await query.fetch();
            items.push(...resp.docs);

            if (resp.page == resp.pages)
                break;

            query = this.page(resp.page + 1) as this;
        }

        return items;
    }
}

/**
 * Base class for requests that return a single item.
 */
class ApiRequestSingle<T> extends ApiRequest<T> {
    async get(): Promise<T> {
        const { docs } = await this.fetch();

        if (docs.length == 0) {
            throw new Error("No items in response");
        }

        return docs[0];
    }
}

/**
 * Creates an API client that can execute authenticated queries.
 * @param token The token to use for authentication.
 */
export function createApi(token: string) {
    const client = axios.create({
        baseURL: "https://the-one-api.dev/v2",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    return {
        /**
         * List of all "The Lord of the Rings" books.
         */
        books: () => new ApiRequestMany<Book>("book", client),
        /**
         * Request one specific book.
         */
        book: (id: string) => new class BookRequest extends ApiRequestSingle<Book> {
            constructor() { super(`book/${id}`, client) }

            /**
             * Request all chapters of a specific book.
             */
            chapters() {
                return new ApiRequestMany<Chapter>(this.path + "/chapter", client);
            }
        },

        /**
         * List of all movies, including the "The Lord of the Rings" and the "The Hobbit" trilogies.
         */
        movies: () => new ApiRequestMany<Movie>("movie", client),
        /**
         * Request one specific movie.
         */
        movie: (id: string) => new class MovieRequest extends ApiRequestSingle<Movie> {
            constructor() { super(`movie/${id}`, client) }

            /**
             * Request all movie quotes for a specific movie (only working for the LotR trilogy).
             */
            quotes() {
                return new ApiRequestMany<Quote>(this.path + "/quote", client);
            }
        },

        /**
         * List of characters including metadata like name, gender, realm, race and more.
         */
        characters: () => new ApiRequestMany<Character>("character", client),
        /**
         * Request one specific character.
         */
        character: (id: string) => new class CharacterRequest extends ApiRequestSingle<Character> {
            constructor() { super(`character/${id}`, client) }

            /**
             * Request all movie quotes of a specific character.
             */
            quotes() {
                return new ApiRequestMany<Quote>(this.path + "/quote", client);
            }
        },

        /**
         * List of all movie quotes.
         */
        quotes: () => new ApiRequestMany<Quote>("quote", client),
        /**
         * Request one specific movie quote.
         */
        quote: (id: string) => new ApiRequestSingle<Quote>(`quote/${id}`, client),

        /**
         * List of all book chapters.
         */
        chapters: () => new ApiRequestMany<Chapter>("chapter", client),
        /**
         * Request one specific book chapter.
         */
        chapter: (id: string) => new ApiRequestSingle<Chapter>(`chapter/${id}`, client),
    }
}
