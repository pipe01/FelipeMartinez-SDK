export interface Model {
    _id: string;
}

export interface Book extends Model {
    name: string;
}

export interface Movie extends Model {
    name: string;
    runtimeInMinutes: number;
    budgetInMillions: number;
    boxOfficeRevenueInMillions: number;
    academyAwardNominations: number;
    academyAwardWins: number;
    rottenTomatoesScore: number;
}

export interface Character extends Model {
    height: string;
    race: string;
    gender: string;
    birth: string;
    spouse: string;
    death: string;
    realm: string;
    hair: string;
    name: string;
    wikiUrl: string;
}

export interface Quote extends Model {
    dialog: string;
    movie: string;
    character: string;
}

export interface BookChapter extends Model {
    chapterName: string;
}

export interface Chapter extends BookChapter {
    book: string;
}
