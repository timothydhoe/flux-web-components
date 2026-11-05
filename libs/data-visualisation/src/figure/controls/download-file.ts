const FALLBACK_FILE_NAME = 'grafiek';

/** Bestandsnaam zonder extensie: de kop van de figuur, anders "grafiek". Tekens die Windows of macOS niet toelaten in
 *  een bestandsnaam worden een streepje. */
export function buildFileName(headline: string): string {
    const safeHeadline = headline
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    return safeHeadline || FALLBACK_FILE_NAME;
}

/** Laat de browser een bestand bewaren: tijdelijke object-URL, klik op een verborgen link, URL weer vrijgeven.
 *  https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static */
export function downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
}
