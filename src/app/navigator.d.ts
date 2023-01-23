interface Navigator {
    msSaveOrOpenBlob: (blob: Blob) => void
    msSaveBlob?: (blob: any, defaultName?: string) => boolean
}