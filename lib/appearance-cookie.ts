export type AppearancePrefs = {
  darkMode: boolean;
  autoCollapseSidebar: boolean;
};

export const DEFAULT_APPEARANCE_PREFS: AppearancePrefs = {
  darkMode: true,
  autoCollapseSidebar: true,
};

const APPEARANCE_COOKIE_KEY = "settings_appearance";
const APPEARANCE_EVENT = "appearance:change";

const decodeCookieValue = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseAppearance = (raw: string | null): AppearancePrefs => {
  if (!raw) return DEFAULT_APPEARANCE_PREFS;

  try {
    const parsed = JSON.parse(raw) as Partial<AppearancePrefs>;
    return {
      darkMode:
        typeof parsed.darkMode === "boolean"
          ? parsed.darkMode
          : DEFAULT_APPEARANCE_PREFS.darkMode,
      autoCollapseSidebar:
        typeof parsed.autoCollapseSidebar === "boolean"
          ? parsed.autoCollapseSidebar
          : DEFAULT_APPEARANCE_PREFS.autoCollapseSidebar,
    };
  } catch {
    return DEFAULT_APPEARANCE_PREFS;
  }
};

export const getAppearancePrefsFromCookie = (): AppearancePrefs => {
  if (typeof document === "undefined") return DEFAULT_APPEARANCE_PREFS;

  const cookieEntry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${APPEARANCE_COOKIE_KEY}=`));

  if (!cookieEntry) return DEFAULT_APPEARANCE_PREFS;

  const rawValue = cookieEntry.slice(APPEARANCE_COOKIE_KEY.length + 1);
  return parseAppearance(decodeCookieValue(rawValue));
};

export const setAppearancePrefsCookie = (prefs: AppearancePrefs) => {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${APPEARANCE_COOKIE_KEY}=${encoded}; path=/; max-age=31536000; samesite=lax`;

  window.dispatchEvent(new Event(APPEARANCE_EVENT));
};

export const setDarkModeCookie = (darkMode: boolean) => {
  const current = getAppearancePrefsFromCookie();
  setAppearancePrefsCookie({
    ...current,
    darkMode,
  });
};

export const APPEARANCE_CHANGE_EVENT = APPEARANCE_EVENT;
