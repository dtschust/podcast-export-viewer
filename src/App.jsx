import { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { parseOpmlToPodcasts } from "./utils/parseOpml.mjs";

export default function PodcastViewerApp() {
  const [data, setData] = useState([]);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [filters, setFilters] = useState({ unplayed: true, played: true, inProgress: true });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const podcasts = parseOpmlToPodcasts(text);
    setData(podcasts);
    setSelectedPodcast(null);
  };

  const handleFilterChange = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const filteredData = data
    .map((podcast) => {
      const filteredEpisodes = podcast.episodes.filter((ep) => {
        if (ep.playedStatus === "unplayed" && filters.unplayed) return true;
        if (ep.playedStatus === "played" && filters.played) return true;
        if (ep.playedStatus === "in progress" && filters.inProgress) return true;
        return false;
      });
      return { ...podcast, episodes: filteredEpisodes };
    })
    .filter((podcast) => podcast.episodes.length > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Podcasts</h2>
        <input
          type="file"
          accept=".opml,.xml"
          onChange={handleFileUpload}
          className="mb-4"
        />

        <div className="mb-4 space-y-1">
          <label className="block font-medium">Filters:</label>
          <label className="block">
            <input
              type="checkbox"
              checked={filters.unplayed}
              onChange={() => handleFilterChange("unplayed")}
              className="mr-2"
            />
            Unplayed
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={filters.played}
              onChange={() => handleFilterChange("played")}
              className="mr-2"
            />
            Played
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={filters.inProgress}
              onChange={() => handleFilterChange("inProgress")}
              className="mr-2"
            />
            In Progress
          </label>
        </div>

        <ul className="space-y-2">
          {filteredData.map((podcast, idx) => (
            <li key={idx}>
              <button
                onClick={() => setSelectedPodcast(podcast)}
                className="w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                {podcast.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2">
        {selectedPodcast ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Episodes of {selectedPodcast.title}
            </h2>
            <div className="space-y-4">
              {selectedPodcast.episodes
                .filter((ep) => {
                  if (ep.playedStatus === "unplayed" && filters.unplayed) return true;
                  if (ep.playedStatus === "played" && filters.played) return true;
                  if (ep.playedStatus === "in progress" && filters.inProgress) return true;
                  return false;
                })
                .map((ep, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{ep.title || "Untitled Episode"}</h3>
                      <p className="text-sm text-gray-600">
                        Released: {ep.releaseDate}
                      </p>
                      <p className="text-sm">Status: {ep.playedStatus}</p>
                      {ep.playedStatus === "in progress" && (
                        <p className="text-sm">
                          Progress: {toHHMMSS(ep.progress)}
                        </p>
                      )}
                      {/* <pre>{JSON.stringify(ep.rawInfo)}</pre> */}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Select a podcast to view episodes.</p>
        )}
      </div>
    </div>
  );
}


function toHHMMSS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}
