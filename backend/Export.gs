const Export = (() => {
  function handleExport(payload, ctx) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const visibleRows = Kvkk.canSeeRaw(ctx.actor) ? rows : rows.map(Kvkk.mask);
    return { format: payload.format || 'json', rows: visibleRows };
  }
  return { handleExport };
})();
