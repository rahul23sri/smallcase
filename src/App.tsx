import { useState } from "react";
import { PortfolioPage } from "./PortfolioPage";
import { StartPage } from "./StartPage";

type Screen = "start" | "new" | "repeat";

export function App() {
  const [screen, setScreen] = useState<Screen>("start");

  if (screen === "start") {
    return <StartPage onChoose={setScreen} />;
  }

  return <PortfolioPage key={screen} flow={screen} onBack={() => setScreen("start")} />;
}
