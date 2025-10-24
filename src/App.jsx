import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Card, Flex, Heading, ScrollArea, Separator, Text } from "@radix-ui/themes";
import { FileIcon, ReloadIcon } from "@radix-ui/react-icons";
import { parseOpmlToPodcasts } from "./utils/parseOpml.mjs";
import defaultData from "../default.json";

const comparePodcastTitles = (a, b) =>
  (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });

export default function PodcastViewerApp() {
  const [data, setData] = useState([]);
  const [selectedPodcastIndex, setSelectedPodcastIndex] = useState(null);
  const [filters, setFilters] = useState({ unplayed: true, played: true, inProgress: true });
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const podcasts = parseOpmlToPodcasts(text);
    setData(podcasts);
    setSelectedPodcastIndex(null);
  };

  const handleLoadDefault = () => {
    const clonedDefault = JSON.parse(JSON.stringify(defaultData)).sort(comparePodcastTitles);
    setData(clonedDefault);
    setSelectedPodcastIndex(null);
  };

  const handleFilterChange = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const handlePodcastSelect = (value) => {
    if (value === "") {
      setSelectedPodcastIndex(null);
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setSelectedPodcastIndex(null);
      return;
    }

    setSelectedPodcastIndex(parsed);
  };

  const filteredData = useMemo(() => {
    return data
      .map((podcast, index) => {
        const filteredEpisodes = podcast.episodes.filter((ep) => {
          if (ep.playedStatus === "unplayed" && filters.unplayed) return true;
          if (ep.playedStatus === "played" && filters.played) return true;
          if (ep.playedStatus === "in progress" && filters.inProgress) return true;
          return false;
        });
        return { ...podcast, episodes: filteredEpisodes, originalIndex: index };
      })
      .filter((podcast) => podcast.episodes.length > 0);
  }, [data, filters]);

  const selectedPodcast =
    selectedPodcastIndex === null
      ? null
      : filteredData.find((podcast) => podcast.originalIndex === selectedPodcastIndex) ?? null;

  useEffect(() => {
    if (selectedPodcastIndex === null) return;
    const stillExists = filteredData.some((podcast) => podcast.originalIndex === selectedPodcastIndex);
    if (!stillExists) {
      setSelectedPodcastIndex(null);
    }
  }, [filteredData, selectedPodcastIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 lg:h-screen">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:h-screen lg:overflow-hidden lg:px-8 lg:py-8">
        <header className="flex flex-col gap-2 lg:flex-none">
          <Heading size="7" weight="bold">
            Podcast Viewer
          </Heading>
          <Text color="gray">
            Import your OPML export or browse the sample feed to review episodes quickly.
          </Text>
        </header>

        <div className="grid gap-6 lg:flex-1 lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
          <section className="glass-panel flex h-full flex-col gap-4 p-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
            <div className="space-y-2">
              <Heading size="4">Library</Heading>
              <Text size="2" color="gray">
                Load an OPML file from your podcast player or explore the curated defaults.
              </Text>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".opml,.xml"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-wrap gap-3">
              <Button
                size="2"
                variant="soft"
                color="iris"
                onClick={() => fileInputRef.current?.click()}
              >
                <Flex align="center" gap="2">
                  <FileIcon />
                  <span>Import OPML</span>
                </Flex>
              </Button>
              <Button
                size="2"
                color="iris"
                variant="solid"
                onClick={handleLoadDefault}
              >
                <Flex align="center" gap="2">
                  <ReloadIcon />
                  <span>Load Default</span>
                </Flex>
              </Button>
            </div>

            <Separator size="4" />

            {filteredData.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
                <Text size="2" color="gray">
                  No podcasts yet. Import a file or load the default sample.
                </Text>
              </div>
            ) : (
              <div className="hidden lg:flex lg:flex-1 lg:min-h-0">
                <ScrollArea type="hover" className="flex-1 pr-2 lg:h-full">
                  <Flex direction="column" gap="2">
                    {filteredData.map((podcast) => {
                      const isActive = podcast.originalIndex === selectedPodcastIndex;
                      return (
                        <button
                          key={`${podcast.title}-${podcast.originalIndex}`}
                          type="button"
                          onClick={() => setSelectedPodcastIndex(podcast.originalIndex)}
                          className={[
                            "w-full rounded-lg border px-4 py-3 text-left transition-all",
                            isActive
                              ? "border-indigo-600 bg-indigo-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <Text size="3" weight="medium">
                              {podcast.title}
                            </Text>
                            <Badge color={isActive ? "iris" : "gray"} variant={isActive ? "soft" : "surface"}>
                              {podcast.episodes.length}
                            </Badge>
                          </div>
                          {podcast.description ? (
                            <Text as="p" size="2" color="gray">
                              {podcast.description}
                            </Text>
                          ) : null}
                        </button>
                      );
                    })}
                  </Flex>
                </ScrollArea>
              </div>
            )}
          </section>

          <section className="glass-panel flex h-full flex-col gap-6 p-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
            <div className="flex flex-col gap-4 lg:flex-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Heading size="4">
                    {selectedPodcast ? selectedPodcast.title : "Episodes"}
                  </Heading>
                  <Text size="2" color="gray">
                    {selectedPodcast
                      ? `${selectedPodcast.episodes.length} episode${selectedPodcast.episodes.length === 1 ? "" : "s"} match your filters.`
                      : "Select a podcast to view its episodes."}
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {filteredData.length > 0 ? (
                  <div className="w-full lg:hidden">
                    <label className="block text-sm font-medium text-slate-600" htmlFor="podcast-select">
                      Podcast
                    </label>
                    <select
                      id="podcast-select"
                      value={selectedPodcastIndex ?? ""}
                      onChange={(event) => handlePodcastSelect(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="">Choose a podcast…</option>
                      {filteredData.map((podcast) => (
                        <option key={`${podcast.title}-${podcast.originalIndex}`} value={podcast.originalIndex}>
                          {podcast.title} ({podcast.episodes.length})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <FilterToggle
                  label="Unplayed"
                  checked={filters.unplayed}
                  onCheckedChange={() => handleFilterChange("unplayed")}
                />
                <FilterToggle
                  label="In Progress"
                  checked={filters.inProgress}
                  onCheckedChange={() => handleFilterChange("inProgress")}
                />
                <FilterToggle
                  label="Played"
                  checked={filters.played}
                  onCheckedChange={() => handleFilterChange("played")}
                />
              </div>

              <Separator size="4" />
            </div>

            <div className="flex-1 min-h-0">
              {selectedPodcast ? (
                selectedPodcast.episodes.length > 0 ? (
                  <ScrollArea type="hover" className="flex-1 pr-2 lg:h-full">
                    <Flex direction="column" gap="4">
                      {selectedPodcast.episodes.map((ep, idx) => {
                        const showProgress =
                          ep.playedStatus === "in progress" &&
                          ep.progress !== undefined &&
                          ep.progress !== null &&
                          ep.progress !== "";
                        return (
                        <Card
                          key={`${ep.title}-${idx}`}
                          className="border border-slate-200 shadow-sm"
                          variant="surface"
                        >
                          <Flex direction="column" gap="3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <Heading size="3">{ep.title || "Untitled Episode"}</Heading>
                              <Badge color="gray" variant="soft">
                                {ep.playedStatus}
                              </Badge>
                            </div>
                            <Text size="2" color="gray">
                              Released {formatDate(ep.releaseDate)}
                            </Text>
                            {showProgress ? (
                              <Text size="2" color="gray">
                                Progress • {toHHMMSS(ep.progress)}
                              </Text>
                            ) : null}
                          </Flex>
                        </Card>
                        );
                      })}
                    </Flex>
                  </ScrollArea>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center">
                    <Text size="2" color="gray">
                      This podcast has no episodes with the current filters.
                    </Text>
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/60 p-10 text-center">
                  <Text size="3" color="gray">
                    Choose a podcast from the left to explore its episodes.
                  </Text>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}


function FilterToggle({ label, checked, onCheckedChange }) {
  return (
    <button
      type="button"
      onClick={onCheckedChange}
      className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        checked
          ? "border-indigo-500 bg-indigo-100 text-indigo-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600",
      ].join(" ")}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}

function formatDate(value) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toHHMMSS(totalSecondsStr) {
  const totalSeconds = parseInt(totalSecondsStr, 10);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}
