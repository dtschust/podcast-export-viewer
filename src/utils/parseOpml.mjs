import { xml2js } from "xml-js";

/**
 * Parse an OPML document into an array of podcasts and their episodes.
 * @param {string} opmlText
 * @returns {Array<{title: string, episodes: Array}>}
 */
export function parseOpmlToPodcasts(opmlText) {
  if (!opmlText) {
    return [];
  }

  const parsed = xml2js(opmlText, { compact: true });
  const podcasts = [];

  const toArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const extractPodcasts = (items) => {
    for (const item of toArray(items)) {
      if (item?._attributes?.xmlUrl) {
        const episodes = toArray(item.outline).map((ep) => ({
          title: ep?._attributes?.title || "",
          releaseDate: ep?._attributes?.pubDate || "",
          playedStatus: ep?._attributes?.progress
            ? "in progress"
            : ep?._attributes?.played === "1"
            ? "played"
            : "unplayed",
          progress: ep?._attributes?.progress,
          rawInfo: ep?._attributes,
        }));

        podcasts.push({
          title: item._attributes.title || "",
          episodes,
        });
      }

      if (item?.outline) {
        extractPodcasts(item.outline);
      }
    }
  };

  extractPodcasts(parsed?.opml?.body?.outline);
  return podcasts;
}
