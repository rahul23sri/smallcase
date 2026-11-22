import { asset } from "./asset";

type StartPageProps = {
  onChoose: (flow: "new" | "repeat") => void;
};

export function StartPage({ onChoose }: StartPageProps) {
  return (
    <div className="desk">
      <article className="phone start">
        <img className="start-logo" src={asset("logo.svg")} alt="smallcase" />
        <div className="start-choices">
          <button type="button" className="start-choice" onClick={() => onChoose("new")}>
            New User Flow
            <img src={asset("arrow-circle.svg")} alt="" />
          </button>
          <button type="button" className="start-choice" onClick={() => onChoose("repeat")}>
            Repeat User Flow
            <img src={asset("arrow-circle.svg")} alt="" />
          </button>
        </div>
        <p className="start-note">
          <strong>Please note:</strong>
          The following flow includes only a portfolio page for the current scope.
        </p>
      </article>
    </div>
  );
}
