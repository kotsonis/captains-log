import {Component} from 'react';
import Auth from './auth/Auth'
import logo from './seafaring-818029_1280.jpg';
import './App.css';
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'
import {EditJournal}  from './components/EditJournalEntry'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/RouteNotFound'
import {CreateJournal } from './components/CreateJournalEntry'
import {ViewJournal} from './components/ViewEntryDetails'

import { Entries } from './components/JournalEntries'
export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}
export default class App extends Component<AppProps, AppState> {
  /**
   * App constructor. 
   * simply binds the functions to this
   * @param props 
   */
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }
  /**
   * call auth.login()
   */
  handleLogin() {
    this.props.auth.login()
  }
  /**
   * call auth.logout()
   */
  handleLogout() {
    this.props.auth.logout()
  }
  /**
   * Render this class (calls generate menu and generate current page)
   * @returns the HTML that the browser will render
   */
  render() {
    return (
      <div>
        <header className="App-header">
        <div className="container">
          <div className="image">
            <img src={logo} className="App-logo" alt="logo" />
          </div>
          <div className="text">
            <p> Captain's Log </p>
          </div>
        </div>
        
      </header>
        <Segment style={{ padding: '2em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }
  /**
   * Simple menu with Home button (on all pages) and login/logout
   * @returns 
   */
  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  /**
   * Display login or logout, according to if we are authenticated or not
   * @returns 
   */
  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Entries {...props} auth={this.props.auth} />
          }}
        />
        
        <Route
          path="/entries/:entryId/edit"
          exact
          render={props => {
            return <EditJournal {...props} auth={this.props.auth} />
          }}
        />
        <Route
          path="/entries/:entryId/view"
          exact
          render={props => {
          return <ViewJournal {...props} auth={this.props.auth} />
          }} 
          />
        <Route
          path="/entries/:entryId/create"
          exact
          render={props => {
            return <CreateJournal {...props} auth={this.props.auth} />
          }}
          />

        <Route component={NotFound} />
      </Switch>
    )
  }
}

