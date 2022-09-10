export interface Model {
    _id: String;
}

export interface Book extends Model {
    name: String;
}

export interface Movie extends Model {
    name: String;
    runtimeInMinutes: number;
    budgetInMillions: number;
    boxOfficeRevenueInMillions: number;
    academyAwardNominations: number;
    academyAwardWins: number;
    rottenTomatoesScore: number;
}
