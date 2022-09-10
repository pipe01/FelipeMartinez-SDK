import { Book } from "./models";
import { QueryParams } from "./utils";

type ItemType<T> = T extends (infer TItem)[] ? TItem : T;

abstract class ApiRequest<T> {
    private readonly query = new QueryParams();

    constructor(private path: String) {
    }

    protected fetch(): Promise<T[]> {
        return 
    }
}

class ApiRequestMany<T> extends ApiRequest<T> {
    limit(n: number): Omit<this, "limit"> {
        return this;
    }

    page(n: number): Omit<this, "page"> {
        return this;
    }

    offset(n: number): Omit<this, "offset"> {
        return this;
    }

    sort(field: keyof ItemType<T>, direction: "asc" | "desc"): Omit<this, "sort"> {
        return this;
    }

    get(): Promise<T[]> {
        return this.fetch();
    }
}

class ApiRequestSingle<T> extends ApiRequest<T> {
    get(): Promise<T> {
        return this.fetch().then(o => o[0]);
    }
}

export function books(): ApiRequestMany<Book> {
    return new ApiRequestMany<Book>("book");
}

export function book(id: string): ApiRequestSingle<Book> {
    return new ApiRequestSingle<Book>("book");
}
