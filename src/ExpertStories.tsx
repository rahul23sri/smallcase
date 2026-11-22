import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { asset } from "./asset";

export type ExpertStory = {
  title: string;
  poster: string;
  video?: string;
};

export const EXPERT_STORIES: ExpertStory[] = [
  { title: "Into the wild", poster: asset("story-1.png"), video: asset("intro_1.mp4") },
  { title: "Chasing the coast", poster: asset("story-2.png"), video: asset("intro_2.mp4") },
  { title: "After the sun", poster: asset("story-3.png"), video: asset("intro_3.mp4") },
];

type ExpertStoriesProps = {
  onClose: () => void;
  onStoryEnded: (index: number) => void;
};

function formatTime(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

export function ExpertStories({ onClose, onStoryEnded }: ExpertStoriesProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const onStoryEndedRef = useRef(onStoryEnded);
  const seenRef = useRef(new Set<number>());
  const story = EXPERT_STORIES[index];
  const last = index === EXPERT_STORIES.length - 1;
  onCloseRef.current = onClose;
  onStoryEndedRef.current = onStoryEnded;

  useEffect(() => {
    const phone = document.querySelector(".phone");
    phone?.classList.add("is-stage");
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % EXPERT_STORIES.length);
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current === 0 ? current : current - 1));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      phone?.classList.remove("is-stage");
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !story.video) return;
    setProgress(0);
    setDuration(null);
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [index, story.video]);

  function go(step: number) {
    setProgress(0);
    setDuration(null);
    setIndex((current) => {
      const next = current + step;
      if (next < 0) return current;
      if (next >= EXPERT_STORIES.length) return 0;
      return next;
    });
  }

  return createPortal(
    <div className="stories" role="dialog" aria-modal="true" aria-label="Arvind Kothari stories">
      <div className="stories-phone">
        <div className="stories-status">
          <span>9:41</span>
          <button ref={closeRef} type="button" className="stories-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="stories-stage">
          <img className="stories-still" src={story.poster} alt="" />
          {story.video ? (
            <video
              key={story.video}
              ref={videoRef}
              className="stories-video"
              src={story.video}
              poster={story.poster}
              playsInline
              onLoadedMetadata={(event) => setDuration(formatTime(event.currentTarget.duration))}
              onTimeUpdate={(event) => {
                const clip = event.currentTarget;
                if (!clip.duration) return;
                setProgress(clip.currentTime / clip.duration);
              }}
              onEnded={() => {
                if (seenRef.current.has(index)) return;
                seenRef.current.add(index);
                onStoryEndedRef.current(index);
                go(1);
              }}
            />
          ) : null}
          <div className="stories-scrim" />
          <div className="stories-bars" aria-hidden="true">
            {EXPERT_STORIES.map((item, itemIndex) => (
              <span
                key={item.title}
                className={`stories-bar${itemIndex < index ? " is-done" : ""}${
                  itemIndex === index ? " is-current" : ""
                }${itemIndex === index && story.video ? " is-timed" : ""}`}
              >
                {itemIndex === index && story.video ? (
                  <span style={{ transform: `scaleX(${progress})` }} />
                ) : null}
              </span>
            ))}
          </div>
          <div className="stories-profile">
            <div className="stories-avatar">
              <img src={asset("story-avatar.png")} alt="" />
            </div>
            <div>
              <p className="stories-name">Arvind Kothari</p>
              <p className="stories-meta">15 years of experience</p>
            </div>
          </div>
          <p className="stories-count">
            {index + 1} / {EXPERT_STORIES.length}
          </p>
          <p className="stories-badge">{duration ?? "LOADING..."}</p>
          {index > 0 ? (
            <button
              type="button"
              className="stories-tap stories-tap-left"
              aria-label="Previous story"
              onClick={() => go(-1)}
            />
          ) : null}
          <button
            type="button"
            className="stories-tap stories-tap-right"
            aria-label={last ? "Replay stories" : "Next story"}
            onClick={() => go(1)}
          />
        </div>
        <div className="stories-actions">
          {index > 0 ? (
            <button type="button" className="stories-back" onClick={() => go(-1)}>
              Back
            </button>
          ) : null}
          <button type="button" className="stories-next" onClick={() => go(1)}>
            {last ? "Replay" : "Next"}
          </button>
        </div>
        <p className="stories-hint">Tap right to explore all 3 videos</p>
        <div className="stories-home" />
      </div>
    </div>,
    document.body,
  );
}
