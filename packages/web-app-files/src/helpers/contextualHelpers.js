// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}
export const shareInviteCollaboratorHelp = {
  text: $gettext('Invite persons or groups to access this file or folder.'),
  list: [
    $gettext('Enter a name or group to share this item'),
    $gettext(
      'If you share a folder,  all of its contents and subfolders will be shared with the entered persons or groups'
    ),
    $gettext('Invited persons or groups will be notified via e-mail or in-app notification'),
    $gettext('Invited persons can not see who else has access')
  ],
  readMoreLink: 'https://owncloud.dev'
}
