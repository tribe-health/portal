import React, { useRef, Fragment, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Modal from '../components/Modal'
import { makeStyles } from '@material-ui/core/styles'
import * as ROLES from '../constants/roles'
import Toast from '../components/Toast'
import { Redirect } from 'react-router-dom'
import { withStore } from '../store'
import * as ROUTES from '../constants/routes'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import photo_add from '../../assets/photo-add.svg'
import Logging from '../util/logging'
import PendingOperationButton from '../components/PendingOperationButton'
import ResetPasswordModal from '../components/ResetPasswordModal'

const useStyles = makeStyles({
  root: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'bolder',
    color: '#383838',
    marginTop: 20,
    padding: 40,
    paddingLeft: 8,
  },
})

const inputStyles = makeStyles({
  root: {
    fontFamily: 'Montserrat',
    boxShadow: 'inset 0px 2px 10px rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    border: '2px solid #BDBDBD',
    paddingLeft: 10,
    width: '75%',
    height: 40,
    lineHeight: 30,
    fontSize: 18,
    marginTop: 25,
    marginBottom: 40,
  },
})

const secondaryButtonStyles = makeStyles({
  root: {
    fontFamily: 'Montserrat',
    color: '#2C58B1',
    width: '195px',
    height: 35,
    fontSize: '18px',
    fontWeight: '600',
    padding: '5px',
    border: '2px solid #BDBDBD',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    marginTop: 25,
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

const MAXFILESIZE = 10 * 1024 * 1024
const SettingsBase = observer((props) => {
  const classes = useStyles()
  const input = inputStyles()
  const imgUploader = useRef()

  const secondaryButton = secondaryButtonStyles()
  const [open, setOpen] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [toastInfo, setToastInfo] = useState({
    success: false,
    msg: '',
  })
  const toastRef = useRef()

  const resetPassword = async (e) => {
    e.preventDefault()
    setShowResetPasswordModal(true)
  }

  const onChange = async (event) => {
    if (event.target.name == 'prefix') {
      props.store.updateUser({ prefix: event.target.value })
    } else if (event.target.name == 'firstName') {
      props.store.updateUser({ firstName: event.target.value })
    } else if (event.target.name == 'lastName') {
      props.store.updateUser({ lastName: event.target.value })
    }
  }

  const saveImage = async () => {
    if (imgUploader.current.files.length == 0) {
      Logging.log('no image uploaded')
      return
    }
    try {
      let size = imgUploader.current.files[0].size

      if (size > MAXFILESIZE) {
        setToastInfo({
          success: false,
          msg: 'Exceeded Max Image file size. Image has to be less than 10MB',
        })
        toastRef.current.show()
        imgUploader.current.value = null
      }
      let reader = new FileReader()
      // set up onload trigger to run when data is read
      reader.onload = async (e) => {
        return props.store
          .updateUserImage(e.target.result)
          .then(() => {
            setToastInfo({
              success: true,
              msg: 'Image Updated',
            })
            toastRef.current.show()
            setOpen(false)
          })
          .catch(() => {
            setToastInfo({
              success: false,
              msg: 'Error Updating Image, Please Try Again',
            })
            toastRef.current.show()
          })
      }
      // read data
      return reader.readAsDataURL(imgUploader.current.files[0])
    } catch (err) {
      Logging.log(err)
      return false
    }
  }

  const onChangePasswordSuccess = () => {
    setToastInfo({
      success: true,
      msg: 'Password Succesfully Reset',
    })
    toastRef.current.show()
    setShowResetPasswordModal(false)
  }

  const onChangePasswordFailure = (message) => {
    setToastInfo({
      success: false,
      msg: message,
    })
    toastRef.current.show()
  }

  const onChangePasswordClose = () => {
    setShowResetPasswordModal(false)
  }

  const changeImageModal = (
    <div className="modal-content">
      <p> Please Select a File to Upload </p>
      <input type="file" ref={imgUploader} accepts="image/jpeg, image/png" />
      <PendingOperationButton operation={saveImage} className="save-button">
        Upload
      </PendingOperationButton>
    </div>
  )

  const settingsForm = () => (
    <Fragment>
      <form>
        <Grid container className={classes.root} spacing={2} direction="row" justify="center">
          <Grid item xs={4} xl={2}>
            <Grid container spacing={2} direction="column">
              Profile Photo
              <div
                style={{
                  marginTop: '25px',
                  height: '217px',
                  width: '212px',
                  backgroundColor: '#E0E0E0',
                  border: '2px dashed #828282',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  alt={props.store.data.user.imageBlob ? 'Profile photo' : 'Your profile photo would go here.'}
                  src={props.store.data.user.imageBlob ? props.store.data.user.imageBlob : photo_add}
                  className="profile_photo"
                  style={
                    props.store.data.user.imageBlob
                      ? { width: 212, height: 217, resize: 'cover' }
                      : { width: 100, height: 102, paddingLeft: 10, paddingTop: 10 }
                  }
                ></img>
              </div>
              <div style={{ marginTop: '15px', fontSize: '12px', fontWeight: 'normal', color: '#383838' }}>
                Accepted file types: jpg or png
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#383838' }}>Maximum file size: 10 MB</div>
              <button onClick={() => setOpen(true)} type="button" className={secondaryButton.root}>
                Change Image
              </button>
              <Modal
                hidden={!open}
                onClose={() => {
                  setOpen(false)
                }}
                containerClass="changeImageModalContainer"
              >
                {changeImageModal}
              </Modal>
            </Grid>
          </Grid>

          <Grid item xs={4} xl={5}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="prefix">Prefix</label>
              <input
                type="text"
                id="prefix"
                name="prefix"
                className={input.root}
                onChange={onChange}
                value={props.store.data.user.prefix}
              ></input>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                aria-required="true"
                className={input.root}
                onChange={onChange}
                value={props.store.data.user.firstName}
              ></input>
              <label htmlFor="email">Email Address</label>
              <input
                type="text"
                id="email"
                name="email"
                required
                disabled={true}
                aria-required="true"
                className={input.root}
                style={{ backgroundColor: '#f0f0f0' }}
                value={props.store.data.user.email}
              ></input>
            </Grid>
          </Grid>

          <Grid item xs={4} xl={5}>
            <Grid container spacing={2} direction="column">
              <label htmlFor="role">Role</label>
              {props.store.data.user && (
                <select
                  type="text"
                  id="role"
                  name="role"
                  disabled={true}
                  required
                  aria-required="true"
                  className={input.root}
                  style={{ backgroundColor: '#f0f0f0' }}
                  value={props.store.data.user.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL}
                >
                  <option value={ROLES.ADMIN_LABEL} defaultValue={props.store.data.user.isAdmin}>
                    {ROLES.ADMIN_LABEL}
                  </option>
                  <option value={ROLES.NON_ADMIN_LABEL} defaultValue={!props.store.data.user.isAdmin}>
                    {ROLES.NON_ADMIN_LABEL}
                  </option>
                </select>
              )}
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                aria-required="true"
                onChange={onChange}
                className={input.root}
                defaultValue={props.store.data.user.lastName}
              ></input>
              <label htmlFor="password">Password</label>
              <input
                type="text"
                id="password"
                name="password"
                style={{ backgroundColor: '#f0f0f0', fontSize: '30px' }}
                disabled={true}
                required
                aria-required="true"
                className={input.root}
                defaultValue=" • • • • • • • •"
              ></input>
              <a
                href=""
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#2C58B1',
                  textDecoration: 'none',
                  textAlign: 'end',
                  marginTop: -25,
                  marginRight: '21%',
                }}
                onClick={(e) => resetPassword(e)}
              >
                Change Password
              </a>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <Toast ref={toastRef} isSuccess={toastInfo.success} message={toastInfo.msg} />
    </Fragment>
  )

  return !props.store.data.user.isSignedIn ||
    props.store.data.user.isFirstTimeUser ||
    (props.store.data.user.passwordResetRequested && props.store.data.user.signedInWithEmailLink) ? (
    <Redirect to={ROUTES.LANDING} />
  ) : (
    <React.Fragment>
      <PageTitle title="My Settings" />
      <div className="module-container">
        <div className="header">
          <h1>My Settings</h1>
          <p>Changes are automatically saved</p>
        </div>
        {settingsForm()}
        <ResetPasswordModal
          hidden={!showResetPasswordModal}
          onClose={onChangePasswordClose}
          onSuccess={onChangePasswordSuccess}
          onFailure={onChangePasswordFailure}
        />
      </div>
    </React.Fragment>
  )
})

const Settings = withStore(SettingsBase)

export default Settings
