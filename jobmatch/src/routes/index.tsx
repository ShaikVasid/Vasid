import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  JOBS,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  INDUSTRIES,
  SALARY_RANGES,
  formatSalary,
  type Job,
  type WorkMode,
  type ExperienceLevel,
} from "~/data/jobs";

export const Route = createFileRoute("/")({
  component: JobSearch,
});

function doesJobPassFilters(job: Job, f: Filters): boolean {
  const q = f.query.trim().toLowerCase();
  if (q) {
    const hay = `${job.title} ${job.company} ${job.snippet} ${job.description} ${job.industry}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  if (f.locations.length > 0) {
    const loc = job.location.toLowerCase();
    const state = job.location.split(",").pop()?.trim().toLowerCase() ?? "";
    if (!f.locations.some((l) => loc.includes(l.toLowerCase()) || state.includes(l.toLowerCase()))) {
      return false;
    }
  }

  if (f.workModes.length > 0 && !f.workModes.includes(job.workMode)) return false;

  if (f.salaryRanges.length > 0) {
    const overlaps = f.salaryRanges.some(
      (r) => job.salaryMax >= r.min && job.salaryMin <= r.max,
    );
    if (!overlaps) return false;
  }

  if (f.industries.length > 0 && !f.industries.includes(job.industry)) return false;

  if (f.experience.length > 0 && !f.experience.includes(job.experience)) return false;

  return true;
}

interface Filters {
  query: string;
  locations: string[];
  workModes: WorkMode[];
  salaryRanges: number[]; // indices into SALARY_RANGES
  industries: string[];
  experience: ExperienceLevel[];
}

const EMPTY: Filters = {
  query: "",
  locations: [],
  workModes: [],
  salaryRanges: [],
  industries: [],
  experience: [],
};

function JobSearch() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("recent");

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          JOBS.flatMap((j) => {
            const parts = j.location.split(",").map((s) => s.trim());
            return [j.location, parts[parts.length - 1]];
          }),
        ),
      ).sort(),
    [],
  );

  const results = useMemo(() => {
    const filtered = JOBS.filter((j) => doesJobPassFilters(j, filters));
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "salary") return b.salaryMax - a.salaryMax;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      // default: keep curated order (recently posted first)
      return 0;
    });
    return sorted;
  }, [filters, sortBy]);

  const activeFilterCount =
    (filters.query ? 1 : 0) +
    filters.locations.length +
    filters.workModes.length +
    (filters.salaryRanges.length ? 1 : 0) +
    filters.industries.length +
    filters.experience.length;

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const toggle = <K extends keyof Filters>(
    key: K,
    value: Filters[K] extends (infer T)[] ? T : never,
  ) => {
    setFilters((f) => {
      const arr = f[key] as unknown[];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...f, [key]: next } as Filters;
    });
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      {/* Header / hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Job<span className="text-indigo-600">Match</span>
            </span>
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <a href="#jobs" className="hidden hover:text-slate-900 sm:block">
              Browse jobs
            </a>
            <a
              href="#jobs"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Find a job
            </a>
          </nav>
        </div>
      </header>

      {/* Hero intro */}
      <section className="bg-gradient-to-b from-indigo-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Find a job that{" "}
            <span className="text-indigo-600">actually fits you.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Explore curated roles from across tech, finance, healthcare, and
            beyond. Filter by role, location, work style, and salary — then see a
            shortlist built just for you.
          </p>

          {/* Quick search bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <label className="sr-only" htmlFor="hero-search">
              Search jobs
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="hero-search"
                value={filters.query}
                onChange={(e) => set({ query: e.target.value })}
                placeholder="Search titles, companies, or keywords…"
                className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm outline-none ring-indigo-400 transition focus:ring-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main id="jobs" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filter sidebar */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(EMPTY)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              <FilterGroup title="Location">
                <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                  {locationOptions.map((loc) => (
                    <CheckRow
                      key={loc}
                      label={loc}
                      checked={filters.locations.includes(loc)}
                      onChange={() => toggle("locations", loc)}
                    />
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Work mode">
                {WORK_MODES.map((mode) => (
                  <CheckRow
                    key={mode}
                    label={mode}
                    checked={filters.workModes.includes(mode)}
                    onChange={() => toggle("workModes", mode)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Salary range">
                {SALARY_RANGES.map((r, i) => (
                  <CheckRow
                    key={r.label}
                    label={r.label}
                    checked={filters.salaryRanges.includes(i)}
                    onChange={() => toggle("salaryRanges", i)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Experience level">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <CheckRow
                    key={exp}
                    label={exp}
                    checked={filters.experience.includes(exp)}
                    onChange={() => toggle("experience", exp)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Industry">
                <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                  {INDUSTRIES.map((ind) => (
                    <CheckRow
                      key={ind}
                      label={ind}
                      checked={filters.industries.includes(ind)}
                      onChange={() => toggle("industries", ind)}
                    />
                  ))}
                </div>
              </FilterGroup>
            </div>
          </aside>

          {/* Results */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{results.length}</span>{" "}
                {results.length === 1 ? "job" : "jobs"} found
                {activeFilterCount > 0 && " for your filters"}
              </p>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Sort by
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="recent">Recently posted</option>
                  <option value="salary">Highest salary</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7 text-slate-400">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                    <path d="M8.5 8.5l5 5M13.5 8.5l-5 5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No jobs match your filters
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try removing a filter or two, or clear all filters to see the full
                  list of curated roles.
                </p>
                <button
                  onClick={() => setFilters(EMPTY)}
                  className="mt-5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {results.map((job) => {
                  const isOpen = expandedId === job.id;
                  return (
                    <li key={job.id}>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {job.title}
                              </h3>
                              <Badge tone="indigo">{job.experience}</Badge>
                            </div>
                            <p className="mt-0.5 text-sm font-medium text-slate-600">
                              {job.company} · {job.industry}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">{job.snippet}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                              <Meta icon="pin" text={job.location} />
                              <Meta icon="clock" text={job.workMode} />
                              <Meta icon="calendar" text={"Posted " + job.posted} />
                            </div>
                          </div>

                          <div className="flex flex-shrink-0 flex-col items-start gap-3 sm:items-end">
                            <span className="text-lg font-bold text-slate-900">
                              {formatSalary(job)}
                            </span>
                            <button
                              onClick={() => setExpandedId(isOpen ? null : job.id)}
                              className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {isOpen ? "Hide details" : "View details"}
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
                            <p className="text-sm leading-relaxed text-slate-700">
                              {job.description}
                            </p>

                            {job.responsibilities.length > 0 && (
                              <>
                                <h4 className="mt-5 text-sm font-semibold text-slate-900">
                                  What you'll do
                                </h4>
                                <ul className="mt-2 space-y-1.5">
                                  {job.responsibilities.map((r, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                                      <CheckIcon /> {r}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}

                            {job.requirements.length > 0 && (
                              <>
                                <h4 className="mt-5 text-sm font-semibold text-slate-900">
                                  What we're looking for
                                </h4>
                                <ul className="mt-2 space-y-1.5">
                                  {job.requirements.map((r, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                                      <CheckIcon /> {r}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm text-slate-500">
                                {job.company} · {job.location} · {job.workMode}
                              </p>
                              <button className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                                Apply now
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} JobMatch. Curated roles from across the
            industry.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {JOBS.length} live roles
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2.5 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-400"
      />
      <span>{label}</span>
    </label>
  );
}

function Badge({ tone, children }: { tone: "indigo" | "slate"; children: React.ReactNode }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Meta({ icon, text }: { icon: "pin" | "clock" | "calendar"; text: string }) {
  const icons = {
    pin: <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-slate-400">
        {icons[icon]}
      </svg>
      {text}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
