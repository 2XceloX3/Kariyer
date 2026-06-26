const Kvkk = (() => {
  const SENSITIVE = ['email', 'phone', 'telefon', 'address', 'adres', 'cv'];
  function canSeeRaw(actor) {
    return actor && actor.accessRole === 'super_admin';
  }
  function mask(row) {
    const out = Object.assign({}, row || {});
    Object.keys(out).forEach((key) => {
      if (SENSITIVE.indexOf(key) >= 0) out[key] = '***';
    });
    return out;
  }
  return { canSeeRaw, mask };
})();
