import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EXPERT_STORIES, ExpertStories } from "./ExpertStories";
import { Explainer } from "./Explainer";
import { asset } from "./asset";
import { writeExplainerMemory } from "./explainerMemory";

const TABS = ["Getting Started", "Overview", "Details", "Updates"] as const;
type Tab = (typeof TABS)[number];

const LESSONS: Array<{
  title: string;
  action: string;
  icon: string;
  done: boolean;
  step?: string;
}> = [
  {
    title: "What is smallcase?",
    action: "Know in 30 secs",
    icon: asset("topic-what.svg"),
    done: true,
  },
  {
    title: "Why do I need experts?",
    action: "Listen to pitch",
    icon: asset("topic-why.svg"),
    done: true,
  },
  {
    title: "What are the risks?",
    action: "Know before invest",
    icon: asset("topic-risk.svg"),
    done: false,
    step: "03",
  },
  {
    title: "Know the process",
    action: "Try practice portfolio",
    icon: asset("topic-process.svg"),
    done: false,
    step: "04",
  },
];

const STEPS = [
  {
    title: "Check whether this fits you",
    body: "Review your horizon, comfort with losses and money you can set aside.",
  },
  {
    title: "Review fees & subscribe",
    body: "Activate expert access only when you’re comfortable with the costs.",
  },
  {
    title: "Connect your broker & invest",
    body: "Choose your amount and preview every order before you approve it.",
  },
] as const;

type PortfolioPageProps = {
  flow: "new" | "repeat";
  onBack: () => void;
};

export function PortfolioPage({ flow, onBack }: PortfolioPageProps) {
  const phoneRef = useRef<HTMLElement>(null);
  const [raised, setRaised] = useState(false);
  const [banner, setBanner] = useState<"shown" | "leaving" | "gone">(
    flow === "new" ? "shown" : "gone",
  );
  const [tab, setTab] = useState<Tab>("Getting Started");
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [storiesWatched, setStoriesWatched] = useState(false);
  const [dpAway, setDpAway] = useState(false);
  const [floatAnchor, setFloatAnchor] = useState({ right: 24, bottom: 24 });
  const storiesWatchedRef = useRef(false);
  const seenStoriesRef = useRef(new Set<number>());
  storiesWatchedRef.current = storiesWatched;

  function markStoryWatched(storyIndex: number) {
    seenStoriesRef.current.add(storyIndex);
    if (seenStoriesRef.current.size >= EXPERT_STORIES.length) setStoriesWatched(true);
  }

  function syncDp() {
    const phone = phoneRef.current;
    if (!phone) return;
    const rect = phone.getBoundingClientRect();
    setFloatAnchor({
      right: Math.max(16, window.innerWidth - rect.right + 20),
      bottom: Math.max(16, window.innerHeight - rect.bottom + 24),
    });
    if (storiesWatchedRef.current) {
      setDpAway(false);
      return;
    }
    const portraits = [...phone.querySelectorAll<HTMLElement>("[data-expert-dp]")].filter((el) => {
      const box = el.getBoundingClientRect();
      return box.width > 8 && box.height > 8;
    });
    if (portraits.length === 0) return;
    const visible = portraits.some((el) => {
      const box = el.getBoundingClientRect();
      return box.bottom > rect.top + 4 && box.top < rect.bottom - 4;
    });
    setDpAway(!visible);
  }

  useEffect(() => {
    const phone = phoneRef.current;
    if (!phone) return;
    const onScroll = () => {
      setRaised(phone.scrollTop > 0);
      syncDp();
    };
    const bar = phone.querySelector<HTMLElement>(".app-bar");
    const watchBar = new ResizeObserver(() => {
      if (!bar) return;
      phone.style.setProperty("--app-bar-height", `${bar.offsetHeight}px`);
    });
    if (bar) watchBar.observe(bar);
    onScroll();
    phone.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncDp);
    return () => {
      watchBar.disconnect();
      phone.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncDp);
    };
  }, []);

  useEffect(() => {
    syncDp();
  }, [banner, storiesOpen, storiesWatched]);

  function hideExplainer() {
    if (banner !== "shown") return;
    setBanner("leaving");
    writeExplainerMemory({ watched: true, dismissed: true });
    window.setTimeout(() => setBanner("gone"), 760);
  }

  return (
    <div className="desk">
      <article ref={phoneRef} className={`phone${banner === "gone" ? " is-plain" : ""}`}>
        <header className={`app-bar${raised ? " is-raised" : ""}`}>
          <div className="status" aria-hidden="true">
            <span>9:41</span>
            <span className="status-icons">
              <img src={asset("signal.svg")} alt="" />
              <img src={asset("battery.svg")} alt="" />
            </span>
          </div>
          <div className="nav">
            <button type="button" className="icon-button" aria-label="Back" onClick={onBack}>
              <img src={asset("back.svg")} alt="" />
            </button>
            <p className="brand">smallcase</p>
            <button type="button" className="icon-button" aria-label="Save portfolio">
              <img src={asset("save.svg")} alt="" />
            </button>
            <button type="button" className="icon-button" aria-label="Share">
              <img src={asset("share.svg")} alt="" />
            </button>
          </div>
        </header>

        <div className={`hero${banner === "leaving" ? " is-leaving" : ""}${banner === "gone" ? " is-gone" : ""}`}>
          {banner !== "gone" ? (
            <div className="explainer-clip">
              <Explainer
                leaving={banner === "leaving"}
                onHide={hideExplainer}
                startFresh={flow === "new"}
              />
            </div>
          ) : null}

          <section className="glance" aria-labelledby="portfolio-name">
            <div className="badge-row">
              <span className="lock-badge">🔒 Subscribers only</span>
              <span className="basket-count">Smallcase of 23 IN stocks</span>
            </div>
            <img className="rule" src={asset("rule.svg")} alt="" />
            <div className="identity">
              <div className="mark">
                <img src={asset("mark.png")} alt="" />
              </div>
              <div>
                <h2 id="portfolio-name">Niveshaay TechStack Theme</h2>
                <p>India’s AI build-out & digital economy</p>
              </div>
            </div>
            <dl className="metrics">
              <div>
                <dt>
                  Minimum
                  <br />
                  investment
                </dt>
                <dd>₹102,622</dd>
              </div>
              <div>
                <dt>
                  9 Months absolute
                  <br />
                  return
                </dt>
                <dd className="gain">+43.83%</dd>
              </div>
              <div>
                <dt>
                  Volatility
                  <br />
                  level
                </dt>
                <dd className="high">
                  <img src={asset("volatility.svg")} alt="" />
                  High
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {flow === "repeat" ? (
          <RepeatExpert onOpenStories={() => setStoriesOpen(true)} />
        ) : (
          <FullExpert onOpenStories={() => setStoriesOpen(true)} />
        )}

        <div className="tabs">
          <div className="tabs-row" role="tablist" aria-label="Portfolio sections">
            {TABS.map((name) => {
              const selected = tab === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  id={`tab-${name}`}
                  aria-selected={selected}
                  aria-controls="tab-panel"
                  className={selected ? "is-active" : undefined}
                  onClick={() => setTab(name)}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id="tab-panel"
          aria-labelledby={`tab-${tab}`}
          className="panel"
        >
          <div
            className={`tab-pane${tab === "Getting Started" ? "" : " is-inactive"}`}
            aria-hidden={tab !== "Getting Started"}
            inert={tab !== "Getting Started"}
          >
            <GettingStarted />
            <Pricing />
          </div>
          <div
            className={`tab-pane${tab === "Getting Started" ? " is-inactive" : ""}`}
            aria-hidden={tab === "Getting Started"}
            inert={tab === "Getting Started"}
          >
            <StayTuned />
          </div>
        </div>

        <Footer />
      </article>
      {storiesOpen ? (
        <ExpertStories
          onClose={() => setStoriesOpen(false)}
          onStoryEnded={markStoryWatched}
        />
      ) : null}
      {dpAway && !storiesWatched && !storiesOpen
        ? createPortal(
            <button
              type="button"
              className="dp-float"
              style={{ right: floatAnchor.right, bottom: floatAnchor.bottom }}
              aria-label="Play Arvind Kothari's stories"
              onClick={() => setStoriesOpen(true)}
            >
              <img src={asset("story-avatar.png")} alt="" />
              <img className="avatar-play" src={asset("avatar-play.svg")} alt="" />
            </button>,
            document.body,
          )
        : null}
    </div>
  );
}

function FullExpert({ onOpenStories }: { onOpenStories: () => void }) {
  return (
    <section className="expert" aria-label="Your research team">
      <ExpertCard onOpenStories={onOpenStories} />
    </section>
  );
}

function RepeatExpert({ onOpenStories }: { onOpenStories: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (expanded) sectionRef.current?.focus({ preventScroll: true });
  }, [expanded]);

  return (
    <section
      ref={sectionRef}
      className={`expert${expanded ? " is-open" : " is-compact"}`}
      aria-label="Your research team"
      tabIndex={-1}
    >
      <div className={`mini-shell${expanded ? " is-gone" : ""}`} inert={expanded}>
        <div className="mini-open">
          <div className="mini-card">
            <p className="sebi">
              <img src={asset("verified.svg")} alt="" />
              <span>SEBI-registered: INH000027830</span>
            </p>
            <div className="mini-id">
              <button
                type="button"
                className="story-dp is-mini"
                data-expert-dp=""
                aria-label="Play Arvind Kothari's stories"
                onClick={onOpenStories}
              >
                <img className="mini-portrait" src={asset("expert-mini.png")} alt="" />
              </button>
              <div className="mini-copy">
                <p className="expert-name">Arvind Kothari</p>
                <p className="expert-quote">
                  “I’ll bring research you can understand.
                  <br />
                  Decisions always stay yours”
                </p>
              </div>
              <img className="mini-chevron" src={asset("profile-chevron.svg")} alt="" />
            </div>
            <div className="mini-fee">
              <p>Expert Subscription Fees</p>
              <p className="mini-price">
                <span>₹9439</span>
                <span>/year</span>
              </p>
            </div>
          </div>
          <p className="mini-note">
            Includes: Expert fee + GST • Excludes: Stocks, invest separately
          </p>
          <button
            type="button"
            className="mini-expand"
            aria-expanded={expanded}
            onClick={() => setExpanded(true)}
          >
            Expand expert details
          </button>
        </div>
      </div>
      <div className={`expert-reveal${expanded ? " is-open" : ""}`} inert={!expanded}>
        <div>
          <ExpertCard onOpenStories={onOpenStories} />
        </div>
      </div>
    </section>
  );
}

function ExpertCard({ onOpenStories }: { onOpenStories: () => void }) {
  return (
    <div className="expert-card">
      <p className="sebi">
        <img src={asset("verified.svg")} alt="" />
        <span>SEBI-registered: INH000027830</span>
      </p>
      <div className="expert-id">
        <button
          type="button"
          className="avatar story-dp"
          data-expert-dp=""
          aria-label="Play Arvind Kothari's stories"
          onClick={onOpenStories}
        >
          <img src={asset("expert.png")} alt="" />
          <img className="avatar-play" src={asset("avatar-play.svg")} alt="" />
        </button>
        <div>
          <p className="expert-name">Arvind Kothari</p>
          <p className="expert-quote">
            “I’ll bring research you can understand.
            <br />
            Decisions always stay yours”
          </p>
        </div>
      </div>
      <ul className="services">
        <li>
          <img src={asset("research.svg")} alt="" />
          Market-led, well-researched portfolios
        </li>
        <li>
          <img src={asset("rebalance.svg")} alt="" />
          Timely rebalances, with the why
        </li>
        <li>
          <img src={asset("qa.svg")} alt="" />
          Live Q&A with the research team
        </li>
      </ul>
      <div className="price-card">
        <p className="ribbon">EXPERT-LED. ALWAYS IN YOUR CONTROL</p>
        <div className="price-body">
          <div className="fee-row">
            <p className="fee-label">Expert Subscription Fees</p>
            <p className="fee-value">₹9,439/year</p>
          </div>
          <p className="fee-note">Fixed( &lt;1%/month of the ₹1,02,622 min. investment)</p>
          <button type="button" className="subscribe">
            Subscribe at ₹9439
          </button>
          <p className="plans">Also, available in 3 & 6 months plans</p>
          <img className="rule short" src={asset("rule-short.svg")} alt="" />
          <p className="fineprint">
            Includes: Expert fee + GST • Excludes: Stocks, invest separately
          </p>
        </div>
      </div>
    </div>
  );
}

function GettingStarted() {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const closeSubscribe = useCallback(() => setSubscribeOpen(false), []);

  return (
    <>
      <section className="started">
        <div className="started-title">
          <h2>Getting Started</h2>
          <p>A basket of stocks backing India’s AI build-out and digital economy.</p>
        </div>
        <div className="journey">
          <p>Your learning journey</p>
          <p className="journey-count">2 of 4 complete</p>
        </div>
        <div className="bars" aria-hidden="true">
          <span className="done" />
          <span className="done" />
          <span />
          <span />
        </div>
        <div className="tiles">
          {LESSONS.map((lesson) => (
            <article key={lesson.title} className={lesson.done ? "tile is-done" : "tile"}>
              <div className="tile-top">
                <img src={lesson.icon} alt="" />
                {lesson.done ? (
                  <img src={asset("done.svg")} alt="Completed" />
                ) : (
                  <span className="step-no">{lesson.step}</span>
                )}
              </div>
              <p className="tile-title">{lesson.title}</p>
              <p className="tile-action">{lesson.action}</p>
            </article>
          ))}
        </div>
        <div className="reward">
          <p className="reward-figure">
            <span>25%</span>
            <span>OFF</span>
          </p>
          <span className="reward-rule" aria-hidden="true" />
          <p>Complete all & get 25% off subscription fees.</p>
        </div>
      </section>

      <section className="path">
        <h2>A clear path. At your pace.</h2>
        <ol>
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <p>{step.title}</p>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="control">
          <img src={asset("shield.svg")} alt="" />
          <span>The expert recommends. You approve every buy, sell and rebalance.</span>
        </p>
      </section>

      <section className="practice">
        <div className="practice-card">
          <div className="practice-head">
            <h2>Curious, but not ready yet?</h2>
            <img src={asset("flask.svg")} alt="" />
          </div>
          <p>
            Try a sample buy and rebalance with virtual money. Learn what happens before
            using your own.
          </p>
          <button type="button" onClick={() => setSubscribeOpen(true)}>
            Try a practice portfolio
            <img src={asset("arrow.svg")} alt="" />
          </button>
          <p className="practice-note">No broker connection. No real money. No fee.</p>
        </div>
      </section>
      {subscribeOpen ? <SubscribePopup onClose={closeSubscribe} /> : null}
    </>
  );
}

function phoneFrame() {
  const phone = document.querySelector(".phone");
  if (!phone) {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }
  const rect = phone.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function SubscribePopup({ onClose }: { onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(phoneFrame);

  useEffect(() => {
    const phone = document.querySelector<HTMLElement>(".phone");
    const previousOverflow = phone?.style.overflow ?? "";
    const sync = () => setFrame(phoneFrame());
    sync();
    if (phone) phone.style.overflow = "hidden";
    cardRef.current?.focus();
    window.addEventListener("resize", sync);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      if (phone) phone.style.overflow = previousOverflow;
      window.removeEventListener("resize", sync);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="subscribe-popup" style={frame} onClick={onClose}>
      <div
        ref={cardRef}
        className="subscribe-card"
        role="dialog"
        aria-modal="true"
        aria-label="Subscribe pop up"
        tabIndex={-1}
      >
        <StayTuned />
      </div>
    </div>,
    document.body,
  );
}

function Pricing() {
  return (
    <section className="pricing" aria-labelledby="pricing-title">
      <h2 id="pricing-title">Your money, clearly separated.</h2>
      <div className="pricing-card">
        <div className="pricing-stocks">
          <div className="pricing-label">
            <p>TO BUY STOCKS</p>
            <p>Your asset</p>
          </div>
          <p className="pricing-amount">₹102,622</p>
          <p className="pricing-note">Minimum investment • held in your demat account</p>
        </div>
        <div className="pricing-fee">
          <div className="pricing-label">
            <p>FOR EXPERT SERVICES</p>
            <p>Yearly</p>
          </div>
          <p className="pricing-fee-row">
            <span className="pricing-amount">₹9439</span>
            <span>/ year</span>
          </p>
          <div className="pricing-copy">
            <p>Research, rebalance guidance and live Q&A.</p>
            <p>Renews yearly; cancel future renewals in-app.</p>
          </div>
        </div>
      </div>
      <p className="pricing-fine">
        The subscription fee is not invested in stocks. Brokerage and statutory charges are
        additional. The minimum investment changes with stock prices.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span className="footer-shield">
        <img src={asset("footer-shield.svg")} alt="" />
      </span>
      <p className="footer-count">
        <span>51,309,034</span>
        <span>People trusted us</span>
      </p>
      <span className="footer-rule" aria-hidden="true" />
      <p className="footer-trust">
        A community
        <br />
        built on trust
      </p>
    </footer>
  );
}

function StayTuned() {
  return (
    <section className="stay" aria-label="Stay tuned">
      <p className="stay-title">Stay tuned...</p>
      <div className="stay-card">
        <span className="stay-lock" aria-hidden="true">
          🔐
        </span>
        <div>
          <p>Unlock Full Solution</p>
          <p>
            Subscribe for <strong>Head of Design</strong> for a complete solution :)
          </p>
        </div>
      </div>
    </section>
  );
}
