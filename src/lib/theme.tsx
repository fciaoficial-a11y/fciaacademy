import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type Ctx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<Ctx>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = "fcia-theme";

function readInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark") return v;
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const t = readInitial();
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const apply = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, t);
      document.documentElement.classList.toggle("dark", t === "dark");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => apply(theme === "dark" ? "light" : "dark"),
        setTheme: apply,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Inline script executed pre-hydration to prevent theme flash.
 * Injected via <script> in the root shell head.
 */
export const themeBootScript = `
(function(){try{
  var t = localStorage.getItem('${STORAGE_KEY}');
  if(t!=='light' && t!=='dark') t='dark';
  var c = document.documentElement.classList;
  if(t==='dark'){c.add('dark');}else{c.remove('dark');}
}catch(e){}})();
`;
