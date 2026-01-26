import { ui, defaultLang, languages } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getRouteFromUrl(url: URL): string | undefined {
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) return undefined;
  if (parts[0] in languages) {
    return parts.slice(1).join('/') || undefined;
  }
  return parts.join('/');
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    return `/${l}${path.startsWith('/') ? path : '/' + path}`;
  }
}

export { languages, defaultLang };
