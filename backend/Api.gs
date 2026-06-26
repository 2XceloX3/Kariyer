const Api = (() => {
  const routes = {
    health: { roles: ['anonymous'], handler: () => ({ ok: true, version: Config.VERSION }) },
    getThemeConfig: { roles: ['anonymous', 'super_admin', 'admin', 'company', 'student', 'alumni'], handler: Theme.getThemeConfig },
    saveThemeConfig: { roles: ['super_admin'], handler: Theme.saveThemeConfig },
    export: { roles: ['super_admin', 'admin', 'company', 'student', 'alumni'], handler: Export.handleExport },
  };

  function handleGet(e) {
    return dispatch(String((e.parameter || {}).action || 'health'), e.parameter || {}, e);
  }

  function handlePost(e) {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    return dispatch(String(payload.action || 'health'), payload, e);
  }

  function dispatch(action, payload, event) {
    const route = routes[action];
    if (!route) return json({ success: false, error: 'UNKNOWN_ACTION', action });
    const ctx = Auth.requireAuthorizedContext(route.roles, payload, event);
    const result = route.handler(payload, ctx) || {};
    Audit.log({ action, actor: ctx.actor, result: 'SUCCESS' });
    return json(Object.assign({ success: true }, result));
  }

  function json(payload) {
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  }

  return { handleGet, handlePost, json };
})();
