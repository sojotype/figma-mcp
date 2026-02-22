// generate a random session id
export const getSessionId = () => {
  return (
    figma.currentUser?.sessionId ?? Math.random().toString(36).substring(2, 15)
  );
};
