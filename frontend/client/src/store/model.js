import { types, cast, onSnapshot } from 'mobx-state-tree'
import 'mobx-react-lite/batchingForReactDom'
import Logging from '../util/logging'
import { PAGE_SIZE } from '.'

const User = types
  .model({
    isSignedIn: types.maybe(types.boolean), // frontend-only field
    email: types.string,
    isAdmin: types.boolean,
    disabled: types.boolean,
    prefix: types.maybe(types.string),
    imageBlob: types.maybeNull(types.string),
    firstName: types.string,
    lastName: types.string,
    organizationID: types.string,
    isFirstTimeUser: types.boolean,
    passwordResetRequested: types.maybe(types.boolean),
    passwordResetCompletedInCurrentSession: types.maybe(types.boolean), // frontend-only field
    signedInWithEmailLink: types.maybe(types.boolean), // frontend-only field
  })
  .actions((self) => {
    const __update = (updates) => {
      Object.keys(updates).forEach((key) => {
        if (self.hasOwnProperty(key)) self[key] = updates[key] // eslint-disable-line no-prototype-builtins
      })
      Logging.log('Updated User:')
      Logging.log(self)
    }

    return { __update }
  })

const Organization = types
  .model({
    id: types.string,
    name: types.string,
    welcomeText: types.string,
    enableExposureText: types.string,
    recommendExposureText: types.string,
    notifyingOthersText: types.string,
    exposureInfoText: types.string,
    exposureAboutText: types.string,
    exposureDetailsText: types.string,
    exposureDetailsLearnText: types.string,
    verificationStartText: types.string,
    verificationIdentifierText: types.string,
    verificationIdentifierAboutText: types.string,
    verificationAdministrationDateText: types.string,
    verificationReviewText: types.string,
    verificationSharedText: types.string,
    verificationNotSharedText: types.string,
    diagnosisText: types.string,
    exposureText: types.string,
    members: types.array(User),
    membersPage: types.number,
  })
  .actions((self) => {
    const __update = (updates) => {
      Object.keys(updates).forEach((key) => {
        if (self.hasOwnProperty(key)) self[key] = updates[key] // eslint-disable-line no-prototype-builtins
      })
      Logging.log('Updated Organization:')
      Logging.log(self)
    }

    const __setMembers = (members) => {
      self.members = cast(members)
    }

    const setMembersPage = (page) => {
      self.membersPage = page
    }

    return { __update, __setMembers, setMembersPage }
  })
  .views((self) => ({
    get currentPageOfMembers() {
      return self.members.slice((self.membersPage - 1) * PAGE_SIZE, (self.membersPage - 1) * PAGE_SIZE + PAGE_SIZE)
    },
    get totalPagesOfMembers() {
      return Math.ceil(self.members.length / PAGE_SIZE)
    },
  }))

const Store = types.model({
  user: User,
  organization: Organization,
})

const defaultUser = {
  isSignedIn: false,
  email: '',
  isAdmin: false,
  disabled: false,
  prefix: '',
  firstName: '',
  lastName: '',
  organizationID: '',
  imageBlob: null,
  isFirstTimeUser: true,
  passwordResetRequested: false,
  passwordResetCompletedInCurrentSession: false,
  signedInWithEmailLink: false,
}

const defaultOrganization = {
  id: '',
  name: '',
  welcomeText: '',
  enableExposureText: '',
  recommendExposureText: '',
  notifyingOthersText: '',
  exposureInfoText: '',
  exposureAboutText: '',
  exposureDetailsText: '',
  exposureDetailsLearnText: '',
  verificationStartText: '',
  verificationIdentifierText: '',
  verificationIdentifierAboutText: '',
  verificationAdministrationDateText: '',
  verificationReviewText: '',
  verificationSharedText: '',
  verificationNotSharedText: '',
  diagnosisText: '',
  exposureText: '',
  members: [],
  membersPage: 1,
}

const defaultStore = {
  user: defaultUser,
  organization: defaultOrganization,
}

let initialStore = defaultStore

// Based on https://egghead.io/lessons/react-store-store-in-local-storage
if (sessionStorage.getItem('store')) {
  initialStore = JSON.parse(sessionStorage.getItem('store'))
}

const rootStore = Store.create({
  ...initialStore,
})

// Based on https://egghead.io/lessons/react-store-store-in-local-storage
onSnapshot(rootStore, (snapshot) => {
  sessionStorage.setItem('store', JSON.stringify(snapshot))
})

export { rootStore, defaultUser, defaultOrganization }
