import { Page } from 'playwright'
import { createLink, editLink, createLinkArgs, editLinkArgs } from './actions'
import { LinksEnvironment } from '../../../environment'

export class Link {
  #page: Page
  #linksEnvironment: LinksEnvironment

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#linksEnvironment = new LinksEnvironment()
  }

  async create(args: Omit<createLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    const url = await createLink({ ...args, page: this.#page })

    this.#linksEnvironment.storeLink({
      key: args.name,
      link: { name: args.name, url, password: args.password }
    })

    await this.#page.goto(startUrl)
  }

  async edit(args: Omit<editLinkArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    const url = await editLink({ page: this.#page, ...args })

    this.#linksEnvironment.storeLink({
      key: args.newName,
      link: { name: args.newName, url, password: args.password }
    })
    await this.#page.goto(startUrl)
  }
}
