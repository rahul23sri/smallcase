import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { asset } from "./asset";
import { readExplainerMemory, writeExplainerMemory } from "./explainerMemory";

const EXPLAINER_VIDEO = asset("smallcase_explain.mp4");

type ExplainerProps = {
  leaving: boolean;
  onHide: () => void;
  startFresh?: boolean;
};

function formatTime(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

export function Explainer({ leaving, onHide, startFresh = false }: ExplainerProps) {
  const memory = useRef(
    startFresh ? { watched: false, dismissed: false } : readExplainerMemory(),
  );
  const [watched, setWatched] = useState(memory.current.watched);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<string | null>(null);
  const seenRef = useRef(memory.current.watched);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function closeStage() {
    setOpen(false);
  }

  function replay() {
    const video = videoRef.current;
    if (!video) return;
    setProgress(0);
    video.currentTime = 0;
    void video.play().catch(() => {});
  }

  function markWatched() {
    if (seenRef.current) return;
    seenRef.current = true;
    setWatched(true);
    setProgress(1);
    writeExplainerMemory({ watched: true, dismissed: false });
  }

  useEffect(() => {
    if (!open) return;
    const phone = document.querySelector(".phone");
    phone?.classList.add("is-stage");
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeStage();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      phone?.classList.remove("is-stage");
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    if (!video) return;
    setProgress(0);
    setDuration(null);
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [open]);

  return (
    <section
      className={`explainer${leaving ? " is-leaving" : ""}`}
      aria-label="What is smallcase"
    >
      <div className="explainer-row">
        <div className="poster">
          <img
            className="poster-still"
            src={asset("explainer-poster.png")}
            alt="A short introduction to smallcase"
          />
          <button
            type="button"
            className="poster-hit"
            onClick={() => setOpen(true)}
            aria-label={watched ? "Replay introduction" : "Play introduction"}
          >
            <span className={`play-glyph${open || watched ? " is-hidden" : ""}`}>
              <img src={asset("play.svg")} alt="" />
            </span>
          </button>
        </div>

        <div className="explainer-copy">
          <div className="explainer-lead">
            <p className="eyebrow">NEW HERE?, WHAT IS SMALLCASE?</p>
            <h1>
              It’s not a fund.
              <br />
              It’s not a broker.
            </h1>
          </div>
          <p className="explainer-body">
            Know how you can upgrade your investments in 30 seconds
          </p>
          <div className={`cta-slot${watched ? " is-open" : ""}`}>
            <div>
              {watched ? (
                <button type="button" className="hide-cta" onClick={onHide}>
                  I understood, hide it!
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {open
        ? createPortal(
            <div className="stories" role="dialog" aria-modal="true" aria-label="What is smallcase">
              <div className="stories-phone">
                <div className="stories-status">
                  <span>9:41</span>
                  <button ref={closeRef} type="button" className="stories-close" onClick={closeStage}>
                    Close
                  </button>
                </div>
                <div className="stories-stage">
                  <img className="stories-still" src={asset("explainer-poster.png")} alt="" />
                  <video
                    ref={videoRef}
                    className="stories-video"
                    src={EXPLAINER_VIDEO}
                    poster={asset("explainer-poster.png")}
                    playsInline
                    onLoadedMetadata={(event) =>
                      setDuration(formatTime(event.currentTarget.duration))
                    }
                    onTimeUpdate={(event) => {
                      const clip = event.currentTarget;
                      if (!clip.duration) return;
                      setProgress(clip.currentTime / clip.duration);
                    }}
                    onEnded={markWatched}
                  />
                  <div className="stories-scrim" />
                  <div className="stories-bars" aria-hidden="true">
                    <span className="stories-bar is-current is-timed">
                      <span style={{ transform: `scaleX(${progress})` }} />
                    </span>
                  </div>
                  <div className="stories-profile">
                    <div className="stories-avatar">
                      <img src={asset("mark.png")} alt="" />
                    </div>
                    <div>
                      <p className="stories-name">smallcase</p>
                      <p className="stories-meta">Know in 30 secs</p>
                    </div>
                  </div>
                  <p className="stories-badge">{duration ?? "LOADING..."}</p>
                  <button
                    type="button"
                    className="stories-tap stories-tap-right"
                    aria-label="Replay introduction"
                    onClick={replay}
                  />
                </div>
                <div className="stories-actions">
                  <button type="button" className="stories-next" onClick={replay}>
                    Replay
                  </button>
                </div>
                <div className="stories-home" />
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
