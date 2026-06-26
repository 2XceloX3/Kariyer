const Audit = (() => {
  function log(entry) {
    try {
      console.log(JSON.stringify(Object.assign({ at: new Date().toISOString() }, entry || {})));
    } catch (e) {}
  }
  return { log };
})();
