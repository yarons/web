<template>
  <div class="oc-flex oc-flex-between oc-flex-middle oc-pl-s">
    <div v-if="modifiable">
      <oc-button
        :id="`edit-public-link-role-dropdown-toggl-${link.id}`"
        appearance="raw"
        gap-size="none"
      >
        <span v-text="visibilityHint" />
        <oc-icon name="arrow-down-s" />
      </oc-button>
      <oc-drop
        ref="editPublicLinkRoleDropdown"
        :drop-id="`edit-public-link-role-dropdown`"
        :toggle="`#edit-public-link-role-dropdown-toggl-${link.id}`"
        mode="click"
      >
        <oc-list>
          <li v-for="(role, i) in availableRoleOptions" :key="`role-dropdown-${i}`">
            <!-- needs "active" handling && correct permission "calculation" -->
            <oc-button
              appearance="raw"
              @click="
                updateLink({
                  link: {
                    ...link,
                    permissions: role.role.permissions()
                  },
                  dropRef: $refs.editPublicLinkRoleDropdown
                })
              "
            >
              <span v-text="role.label" />
            </oc-button>
          </li>
        </oc-list>
      </oc-drop>
    </div>
    <p v-else class="oc-my-rm" v-text="visibilityHint" />

    <div :class="{ 'oc-pr-s': !modifiable }" class="details-buttons">
      <oc-button
        v-if="link.indirect"
        v-oc-tooltip="viaTooltip"
        type="router-link"
        class="oc-files-file-link-via"
        appearance="raw"
        :to="viaRouterParams"
      >
        <oc-icon name="folder-shared" fill-type="line" />
      </oc-button>
      <oc-icon
        v-if="link.password"
        v-oc-tooltip="passwortProtectionTooltip"
        name="lock-password"
        fill-type="line"
        :aria-label="passwortProtectionTooltip"
      />
      <oc-icon
        v-if="link.expiration"
        v-oc-tooltip="expirationDateTooltip"
        class="oc-files-public-link-expires"
        :data-testid="`files-link-id-${link.id}-expiration-date`"
        :aria-label="expirationDateTooltip"
        name="calendar"
        fill-type="line"
      />
      <div v-if="modifiable">
        <oc-button :id="`edit-public-link-dropdown-toggl-${link.id}`" appearance="raw">
          <oc-icon name="more-2" />
        </oc-button>
        <oc-drop
          ref="editPublicLinkDropdown"
          :drop-id="`edit-public-link-dropdown`"
          :toggle="`#edit-public-link-dropdown-toggl-${link.id}`"
          mode="click"
        >
          <oc-list>
            <li v-for="(option, i) in editOptions" :key="`public-link-edit-option-${i}`">
              <oc-button
                appearance="raw"
                :variation="option.variation"
                @click="option.method"
                v-text="option.title"
              />
            </li>
          </oc-list>
        </oc-drop>
      </div>
    </div>
  </div>
</template>

<script>
import { basename } from 'path'
import Mixins from '../../../../mixins'
import { createLocationSpaces, isLocationSpacesActive } from '../../../../router'
import { DateTime } from 'luxon'
import { linkRoleDescriptions } from '../../../../helpers/share'

export default {
  name: 'DetailsAndEdit',
  mixins: [Mixins],
  props: {
    availableRoleOptions: {
      type: Array,
      required: true
    },
    expirationDate: {
      type: Object,
      required: false
    },
    link: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    passwordEnforced: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    visibilityHint() {
      return linkRoleDescriptions[parseInt(this.link.permissions)]
    },

    editButtonLabel() {
      return this.$gettext('Edit public link')
    },

    editOptions() {
      const result = []
      // enabled equals false for oCIS, what am I missing here? Is this about the default expiry date?
      // if (this.expirationDate.enabled) {
      if (this.link.expiration) {
        // method below needs to open datepicker and "save-on-click" || update method to this.updateLinkExpiryDate
        result.push({
          title: this.$gettext('Edit expiration date'),
          method: () => this.updateLink(),
          variation: 'passive'
        })
        if (!this.expirationDate.enforced) {
          result.push({
            title: this.$gettext('Remove expiration date'),
            method: () =>
              this.updateLink({
                link: {
                  ...this.link,
                  expiration: ''
                }
              }),
            variation: 'passive'
          })
        }
      } else {
        // method below needs to open datepicker and "save-on-click" || update method to this.updateLinkExpiryDate
        result.push({
          title: this.$gettext('Add expiration date'),
          method: () => this.updateLink(),
          variation: 'passive'
        })
      }
      // }

      if (this.link.password) {
        result.push({
          // needs to bubble up into textinput modal
          title: this.$gettext('Edit password'),
          method: () => this.updateLink(),
          variation: 'passive'
        })

        if (!this.passwordEnforced) {
          result.push({
            title: this.$gettext('Remove password'),
            method: () =>
              this.updateLink({
                link: {
                  ...this.link,
                  password: ''
                }
              }),
            variation: 'passive'
          })
        }
      } else {
        result.push({
          // needs to bubble up into textinput modal
          title: this.$gettext('Add password'),
          method: () => this.updateLink(),
          variation: 'passive'
        })
      }

      return [
        ...result,
        {
          title: this.$gettext('Delete public link'),
          method: this.deleteLink,
          variation: 'danger'
        }
      ]
    },

    viaRouterParams() {
      const viaPath = this.link.path
      const locationName = isLocationSpacesActive(this.$router, 'files-spaces-project')
        ? 'files-spaces-project'
        : 'files-spaces-personal-home'

      return createLocationSpaces(locationName, {
        params: {
          item: viaPath || '/',
          storageId: this.$route.params.storageId
        },
        query: {
          scrollTo: basename(viaPath)
        }
      })
    },

    localExpirationDate() {
      return DateTime.fromISO(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toLocaleString(DateTime.DATETIME_FULL)
    },

    expirationDateRelative() {
      return DateTime.fromISO(this.link.expiration)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    },

    expirationDateTooltip() {
      return this.$gettextInterpolate(
        this.$gettext('Expires in %{timeToExpiry} (%{expiryDate})'),
        { timeToExpiry: this.expirationDateRelative, expiryDate: this.localExpirationDate },
        true
      )
    },

    viaTooltip() {
      if (!this.link.indirect) {
        return null
      }
      return this.$gettextInterpolate(
        this.$gettext('Navigate to the parent (%{folderName})'),
        { folderName: basename(this.link.path) },
        true
      )
    },

    passwortProtectionTooltip() {
      return this.$gettext('This link is password-protected')
    }
  },

  methods: {
    updateLink({ link = this.link, dropRef = this.$refs.editPublicLinkDropdown }) {
      this.$emit('updateLink', {
        link,
        updateCurrentLink: () => {
          // this is an "unexpected mutation"
          this.link = link
        }
      })
      dropRef.hide()
    },
    deleteLink() {
      this.$emit('removePublicLink', { link: this.link })
      this.$refs.editPublicLinkDropdown.hide()
    }
  }
}
</script>

<style lang="scss" scoped>
.details-buttons {
  min-width: 5rem !important;
  display: flex;
  justify-content: flex-end;
}
</style>
