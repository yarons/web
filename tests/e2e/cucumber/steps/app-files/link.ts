import { DataTable, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'

When(
  /^"([^"]*)" creates a public link for the following resource(s)? using the (sidebar panel|quick action)$/,
  async function (
    this: World,
    stepUser: string,
    _: string,
    actionType: string,
    stepTable: DataTable
  ) {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const linkObject = new objects.applicationFiles.Link({ page })
    const shareInfo = stepTable.hashes()
    for (const linkShare of shareInfo) {
      const { resource, name, role, dateOfExpiration, password } = linkShare
      await linkObject.create({
        resource,
        name,
        role,
        dateOfExpiration,
        password,
        via: actionType === 'quick action' ? 'QUICK_ACTION' : 'SIDEBAR_PANEL'
      })
    }
  }
)

When('{string} edits the public link named {string} of file {string} changing following',
    async function (this: World, stepUser: string, oldName: any, resource: string, stepTable: DataTable): Promise<void> {
      const {page} = this.actorsEnvironment.getActor({id: stepUser})
      const linkObject = new objects.applicationFiles.Link({page})
      const editInfo = stepTable.hashes()
      for (const linkEdit of editInfo) {
          const {newName, role, dateOfExpiration, password } = linkEdit
          await linkObject.edit({
              resource,
              oldName,
              newName,
              role,
              dateOfExpiration,
              password
          })
      }
    })

