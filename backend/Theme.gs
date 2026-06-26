const Theme = (() => {
  const KEY = 'IESU_GLOBAL_THEME_JSON';
  function defaultTheme() {
    return { mode: 'light', palette: 'corporate', primary: '#0f766e', secondary: '#e11d48' };
  }
  function getThemeConfig() {
    const raw = PropertiesService.getScriptProperties().getProperty(KEY);
    return { theme: raw ? JSON.parse(raw) : defaultTheme() };
  }
  function saveThemeConfig(payload, ctx) {
    const theme = Object.assign(defaultTheme(), payload.theme || {});
    PropertiesService.getScriptProperties().setProperty(KEY, JSON.stringify(theme));
    Audit.log({ action: 'saveThemeConfig', actor: ctx.actor, result: 'SUCCESS' });
    return { theme };
  }
  return { getThemeConfig, saveThemeConfig };
})();
