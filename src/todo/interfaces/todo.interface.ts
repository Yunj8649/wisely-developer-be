export interface SearchType {
    page: number,
    limit: number,
    createdFrom?: Date,
    createdTo?: Date,
    updatedFrom?: Date,
    updatedTo?: Date,
    isCompleted?: boolean,
    contents?: string | RegExp,
}

export interface QueryType {
    createdAt?: object,
    updatedAt?: object,
    deletedAt: null,
    isCompleted?: boolean,
    contents?: string | RegExp,
}