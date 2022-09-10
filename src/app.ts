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
