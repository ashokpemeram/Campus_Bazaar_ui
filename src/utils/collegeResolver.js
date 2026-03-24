import { collegeDomains } from '../config/collegeDomains';

export const formatCollegeName = (domain) => {
    return (domain || '')
        .split('.')[0]
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const resolveCollegeName = (domain) => {
    const normalizedDomain = (domain || '').toLowerCase().trim();
    if (!normalizedDomain) return { collegeName: '', isFallback: true };

    const hasDomain = Object.prototype.hasOwnProperty.call(collegeDomains, normalizedDomain);
    if (hasDomain && collegeDomains[normalizedDomain]) {
        return { collegeName: collegeDomains[normalizedDomain], isFallback: false };
    }

    return { collegeName: formatCollegeName(normalizedDomain), isFallback: true };
};
