module.exports = (permissionBitfield) => {
  const permissions = permissionBitfield.serialize()
  return Object.keys(permissions).filter(permission => permissions[permission])
}
