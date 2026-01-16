/**
 * Get the current user's WID, trying PnUser first and falling back to LidUser
 * @returns {Promise<object|undefined>} The user's WID or undefined if not found
 */
export async function getMeUser() {
  const pnUser = await Store.MaybeMeUser.getMaybeMePnUser?.();
  if (pnUser) {
    return pnUser;
  }
  return await Store.MaybeMeUser.getMaybeMeLidUser?.();
}
