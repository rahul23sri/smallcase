const KEY = "smallcase.explainer";

export type ExplainerMemory = {
  watched: boolean;
  dismissed: boolean;
};

const empty: ExplainerMemory = { watched: false, dismissed: false };

export function readExplainerMemory(): ExplainerMemory {
  const params = new URLSearchParams(window.location.search);
  if (params.has("fresh")) {
    window.localStorage.removeItem(KEY);
    params.delete("fresh");
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
    return empty;
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ExplainerMemory>;
    return {
      watched: parsed.watched === true,
      dismissed: parsed.dismissed === true,
    };
  } catch {
    return empty;
  }
}

export function writeExplainerMemory(next: ExplainerMemory) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
