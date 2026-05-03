export type Redaction = {
  page: number
  x: number
  y: number
  width: number
  height: number
}

export type Magazine = {
  date: string
  nr: number
  identifier: string
  title: string
  year: number
  pageRanges: [number, number][]
  redactions: Redaction[]
  startPage?: number
}

export type PoolMagazine = {
  identifier: string
  uuid?: string
  title: string
  year: number
  pageRanges: [number, number][]
  redactions: Redaction[]
  startPage?: number
}

export interface IMagazineRepository {
  getMagazines(date: string): Promise<Magazine[]>
  getMagazine(date: string, nr: number): Promise<Magazine>
  putMagazines(magazines: Magazine[]): Promise<void>
  deleteMagazines(magazines: Magazine[]): Promise<void>
  editMagazine(
    date: string,
    nr: number,
    magazine: Magazine
  ): Promise<{
    deleted: Magazine | undefined
    previous: Magazine | undefined
  }>
  putPoolMagazines(magazines: PoolMagazine[]): Promise<void>
}
