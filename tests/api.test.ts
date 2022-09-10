import { createApi } from "../src"

const api = createApi(process.env.TOKEN);

describe("books", () => {
    it("can get books", async () => {
        const books = await api.books().get();
    
        expect(books).toHaveLength(3);
    });

    it("can get book by id", async () => {
        const book = await api.book("5cf5805fb53e011a64671582").get();
    
        expect(book).not.toBeNull();
        expect(book.name).toBe("The Fellowship Of The Ring");
    });

    it("can get chapters", async () => {
        const chapters = await api.book("5cf5805fb53e011a64671582").chapters().limit(5).sort("chapterName", "desc").get();

        expect(chapters).toHaveLength(5);
        expect(chapters[0].chapterName).toBe("Three is Company")
    });
});

describe("movies", () => {
    it("can get movies", async () => {
        const movies = await api.movies().limit(5).get();
    
        expect(movies).toHaveLength(5);
    });

    it("can get movie by id", async () => {
        const movie = await api.movie("5cd95395de30eff6ebccde58").get();
    
        expect(movie).not.toBeNull();
        expect(movie.name).toBe("The Unexpected Journey");
    });

    it("can get movie quotes", async () => {
        const quotes = await api.movie("5cd95395de30eff6ebccde5c").quotes().sort("dialog", "desc").limit(5).get();
    
        expect(quotes).toHaveLength(5);
        expect(quotes[0].dialog).toBe("the dwarves delved too greadily and too deep");
    });
});

describe("characters", () => {
    it("can get characters", async () => {
        const chars = await api.characters().limit(5).get();
    
        expect(chars).toHaveLength(5);
    });

    it("can get character by id", async () => {
        const char = await api.character("5cd99d4bde30eff6ebccfbbf").get();
    
        expect(char).not.toBeNull();
        expect(char.name).toBe("Adrahil I");
    });

    it("can get character quotes", async () => {
        const quotes = await api.character("5cd99d4bde30eff6ebccfe9e").quotes().sort("dialog", "desc").limit(5).get();
    
        expect(quotes).toHaveLength(5);
        expect(quotes[0].dialog).toBe("lt is the only way. Master says we must go to Mordor, so we must try.");
    });
});

describe("quotes", () => {
    it("can get quotes", async () => {
        const quotes = await api.quotes().limit(5).get();
    
        expect(quotes).toHaveLength(5);
    });

    it("can get quote by id", async () => {
        const quote = await api.quote("5cd96e05de30eff6ebccee6f").get();
    
        expect(quote).not.toBeNull();
        expect(quote.movie).toBe("5cd95395de30eff6ebccde5b");
        expect(quote.dialog).toBe("oh!");
    });
});

describe("chapters", () => {
    it("can get chapters", async () => {
        const chapters = await api.chapters().limit(5).get();
    
        expect(chapters).toHaveLength(5);
    });

    it("can get chapter by id", async () => {
        const chapter = await api.chapter("6091b6d6d58360f988133b8c").get();
    
        expect(chapter).not.toBeNull();
        expect(chapter.chapterName).toBe("The Shadow of the Past");
    });
});

describe("filters", () => {
    it("can match field", async () => {
        const items = await api.characters().with("name", "==", "Gandalf").get();

        expect(items).toHaveLength(1);
        expect(items[0].name).toBe("Gandalf")
    });

    it("can negative match field", async () => {
        const items = await api.characters().with("name", "!=", "Gandalf").limit(50).get();

        expect(items).toHaveLength(50);
        items.forEach(o => expect(o.name).not.toBe("Gandalf"));
    });

    it("can filter field include values", async () => {
        const items = await api.characters().with("race", "in", ["Hobbit", "Human"]).limit(5).get();

        expect(items).toHaveLength(5);
    });

    it("can filter field exclude values", async () => {
        const items = await api.characters().with("race", "in", ["Orc", "Goblin"]).limit(5).get();

        expect(items).toHaveLength(5);
    });

    it("can filter field exists", async () => {
        const items = await api.characters().withExists("race").limit(5).get();

        expect(items).toHaveLength(5);
    });

    it("can filter field not exists", async () => {
        const items = await api.characters().withNotExists("race").limit(5).get();

        expect(items).toHaveLength(0);
    });

    it("can filter greater than", async () => {
        const items = await api.movies().with("runtimeInMinutes", ">", 50).limit(3).get();

        expect(items).toHaveLength(3);
    });

    it("can filter greater than or equal", async () => {
        const items = await api.movies().with("runtimeInMinutes", ">=", 50).limit(5).get();

        expect(items).toHaveLength(5);
    });

    it("can filter less than", async () => {
        const items = await api.movies().with("runtimeInMinutes", "<", 200).limit(5).get();

        expect(items).toHaveLength(5);
    });

    it("can filter less than or equal", async () => {
        const items = await api.movies().with("runtimeInMinutes", "<=", 200).limit(5).get();

        expect(items).toHaveLength(5);
    });
});