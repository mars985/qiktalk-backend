// -------------------- Presence Registry --------------------
// In-memory map of who is currently online.
//
// We track a *count* of live socket connections per user rather than a single
// boolean, so that having the app open in several tabs/devices works correctly:
// a user only goes offline once their LAST socket disconnects.
//
// This is intentionally not persisted — "online right now" is ephemeral state
// that belongs to the running server. The database only stores `lastseen`
// (the moment a user went offline), which is written from userSockets.js.

const connections = new Map(); // userId (string) -> number of open sockets

/**
 * Register a new socket connection for a user.
 * @returns {boolean} true if the user just transitioned offline -> online.
 */
function addConnection(userId) {
  const id = String(userId);
  const count = connections.get(id) || 0;
  connections.set(id, count + 1);
  return count === 0;
}

/**
 * Remove a socket connection for a user.
 * @returns {boolean} true if the user just transitioned online -> offline.
 */
function removeConnection(userId) {
  const id = String(userId);
  const count = connections.get(id) || 0;

  if (count <= 1) {
    connections.delete(id);
    return count === 1; // only "went offline" if they were actually online
  }

  connections.set(id, count - 1);
  return false;
}

/** Is this user currently connected on at least one socket? */
function isOnline(userId) {
  return connections.has(String(userId));
}

/** Snapshot of every currently-online userId (as strings). */
function getOnlineUserIds() {
  return [...connections.keys()];
}

module.exports = {
  addConnection,
  removeConnection,
  isOnline,
  getOnlineUserIds,
};
