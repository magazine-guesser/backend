export type Redaction = {
    page: number
    x: number
    y: number
    width: number
    height: number
}

export type Magazine = {
    date: string,
    nr: number,
    identifier: string,
    title: string,
    year: number,
    pageRange: [number, number],
    redactions: Redaction[],
    startPage?: number
}

export interface IMagazineRepository {
    getMagazines(date: string): Promise<Magazine[]>
    getMagazine(date: string, nr: number): Promise<Magazine>
    putMagazines(magazines: Magazine[]): Promise<void>
}