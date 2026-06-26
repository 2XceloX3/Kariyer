const Auth = (() => {
  function requireAuthorizedContext(allowedRoles, payload, event) {
    const actor = getActor(payload || {});
    const role = actor.accessRole || actor.role || 'anonymous';
    if (allowedRoles.indexOf('anonymous') < 0 && allowedRoles.indexOf(role) < 0) {
      throw new Error('FORBIDDEN');
    }
    return { actor, now: new Date(), event };
  }

  function getActor(payload) {
    return payload.actor || { role: 'anonymous', accessRole: 'anonymous', email: '' };
  }

  return { requireAuthorizedContext };
})();
