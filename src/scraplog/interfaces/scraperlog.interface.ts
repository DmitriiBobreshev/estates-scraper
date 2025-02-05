export enum ScraperStatus {
    Finished = 'Finished',
    FinishedWithErrors = 'FinishedWithErrors',
    NoRecordsAdded = 'NoRecordsAdded',
    InProgress = 'InProgress'
}

export enum ScraperType {
    Halooglasi = 'Halooglasi',
    Nekretnine = 'Nekretnine',
    Zida = '4Zida',
    CityExpert = 'CityExpert'
}

export enum ScrapLogType {
    Info = 0,
    Warning = 1,
    Error = 2
}