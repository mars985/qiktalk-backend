// userId (string) -> number of open sockets
const connections = new Map(); 

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
    return count === 1;
  }

  connections.set(id, count - 1);
  return false;
}

function isOnline(userId) {
  return connections.has(String(userId));
}

function getOnlineUserIds() {
  return [...connections.keys()];
}

module.exports = {
  addConnection,
  removeConnection,
  isOnline,
  getOnlineUserIds,
};
