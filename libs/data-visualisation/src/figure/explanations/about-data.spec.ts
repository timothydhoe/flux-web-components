import type { ChartMeta } from '../../models/chart.model';
import { buildAboutEntries, hasAboutDetails } from './about-data';

const OPEN_DATA_HREF = 'https://www.vlaanderen.be/open-data';

const buildMeta = (meta: Partial<ChartMeta> = {}): ChartMeta => ({
    source: 'Vlaamse Milieumaatschappij',
    x: { type: 'number', title: 'Jaar' },
    y: { type: 'number', title: 'Magnetische veldsterkte', unit: 'µT' },
    ...meta,
});

describe('buildAboutEntries', () => {
    it('should name the source, with its link', () => {
        const entries = buildAboutEntries(buildMeta({ sourceHref: 'https://www.vmm.be' }), OPEN_DATA_HREF);

        expect(entries[0]).toEqual({
            term: 'Bron',
            description: 'Vlaamse Milieumaatschappij',
            href: 'https://www.vmm.be',
        });
    });

    it('should explain the unit when there is an explanation', () => {
        const meta = buildMeta();
        meta.y.unitInfo = 'microtesla, de sterkte van het magnetisch veld';

        expect(buildAboutEntries(meta, OPEN_DATA_HREF)).toContainEqual({
            term: 'Eenheid',
            description: 'µT: microtesla, de sterkte van het magnetisch veld',
        });
    });

    it('should give just the unit without an explanation', () => {
        expect(buildAboutEntries(buildMeta(), OPEN_DATA_HREF)).toContainEqual({ term: 'Eenheid', description: 'µT' });
    });

    it('should leave out the unit when there is none', () => {
        const meta = buildMeta();
        meta.y = { type: 'number' };

        expect(buildAboutEntries(meta, OPEN_DATA_HREF).map((entry) => entry.term)).toEqual(['Bron']);
    });

    it('should mention open data, linking to the open data page', () => {
        const entries = buildAboutEntries(buildMeta({ isOpenData: true }), OPEN_DATA_HREF);

        expect(entries.at(-1)).toEqual(expect.objectContaining({ term: 'Open data', href: OPEN_DATA_HREF }));
    });
});

describe('hasAboutDetails', () => {
    it('should be false when the source line already says everything', () => {
        expect(hasAboutDetails(buildMeta({ isOpenData: true }))).toBe(false);
    });

    it('should be true when the unit has an explanation', () => {
        const meta = buildMeta();
        meta.y.unitInfo = 'microtesla';

        expect(hasAboutDetails(meta)).toBe(true);
    });
});
