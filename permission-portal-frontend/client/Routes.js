import React, { Fragment, useEffect } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './src/screens/Login'
import BuildInfo from './src/screens/BuildInfo'
import CodeValidations from './src/screens/CodeValidations'
import Settings from './src/screens/Settings'
import AccountBranding from './src/screens/AccountBranding'
import ManageTeams from './src/screens/ManageTeams'
import Footer from './src/components/Footer'
import NavBar from './src/components/NavBar'
import * as ROUTES from './src/constants/routes'
import { withAuthentication } from './src/components/Session'
import { ThemeProvider } from '@material-ui/styles'
import theme from './ui/Theme'
import store from './src/store'

const Routes = () => {
  useEffect(() => {
    if (!store.user) {
      storeInit()
    }
  }, [])

  const storeInit = async () => {
    try {
      await store.initialize()
      console.log(store)
    } catch (err) {
      console.error(err)
    }
  }
  
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Switch>
          <Route path={ROUTES.BUILD_INFO} exact component={BuildInfo} />

          <Route path={ROUTES.LANDING} exact component={Login} />
          <Route path={ROUTES.SETTINGS}>
            <Fragment>
              <NavBar />
              <Settings />
            </Fragment>
          </Route>
          <Route path={ROUTES.CODE_VALIDATIONS}>
            <Fragment>
              <NavBar />
              <CodeValidations />
            </Fragment>
          </Route>
          <Route path={ROUTES.BRANDING}>
            <Fragment>
              <NavBar />
              <AccountBranding />
            </Fragment>
          </Route>
          <Route path={ROUTES.MANAGE_MEMBERS}>
            <Fragment>
              <NavBar />
              <ManageTeams />
            </Fragment>
          </Route>
        </Switch>

        <Switch>
          <Route exact path="/" component={Footer} />
          <Route exact component={() => <Footer branded={true} />} />
        </Switch>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default withAuthentication(Routes)
