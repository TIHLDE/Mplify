import { Grid, Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { HashRouter as Router, Link, Redirect, Route } from "react-router-dom";
import './App.css';
import AdminPage from './Components/AdminPage/AdminPage';
import AwaitingConfirmationPage from './Components/AwaitingConfirmationPage/AwaitingConfirmationPage';
import ConfirmEmailPage from './Components/ConfirmEmailPage/ConfirmEmailPage';
import LoginPage from './Components/LoginPage/LoginPage';
import RegistrationPage from './Components/RegistrationPage/RegistrationPage';

const styles = theme => ({
  root: {
    textAlign: "center"
  },
  paper: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  navigation: {
    textAlign: "left"
  }
});

const authController = {
  isAuthenticated: false,
  authenticate() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.isAuthenticated = true;
    }
  },
  signout() {
    sessionStorage.clear();
    this.isAuthenticated = false;
  }
};

const PrivateRoute = ({ component: Component, onLogout, ...rest }) => (
  <Route
    {...rest}
    render={
      props => authController.isAuthenticated
        ? (<Component {...props} onLogout={onLogout} />)
        : (<Redirect to={{ pathname: "/login", state: { from: props.location } }} />)
    }
  />
);

const ConfirmEmail = ({ match }) => (
  <ConfirmEmailPage match={match} />
);

class App extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    authController.authenticate();
  }

  handleLogIn = () => {
    authController.authenticate();
  }

  handleLogout = () => {
    authController.signout();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className="App">
        <Router>
          <div>
            <Grid container spacing={8}>
              <Grid item xs={2}>
                <div className={classes.root}>
                  <Paper className={classes.paper}>
                    <Typography variant="headline" component="h3">[DEV] Velg scenario</Typography>
                    <hr />
                    <ul className={classes.navigation}>
                      <li>
                        <Link to="/">Ny registrering</Link>
                      </li>
                      <li>
                        <Link to="/awaiting-confirmation">Ferdig med registrering</Link>
                      </li>
                      <li>
                        <Link to="/confirm/asdf1234_brukernavn">Bekrefte epost</Link>
                      </li>
                      <li>
                        <Link to="/admin">Admin</Link>
                      </li>
                      <li>
                        <Link to="/login">Login</Link>
                      </li>
                    </ul>
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={10}>
              </Grid>
            </Grid>
            <br />
            <Route path="/" exact component={RegistrationPage} />
            <Route path="/awaiting-confirmation" exact component={AwaitingConfirmationPage} />
            <Route path="/confirm/:code" exact component={ConfirmEmail} />
            <PrivateRoute path="/admin" exact component={AdminPage} onLogout={this.handleLogout.bind(this)} />
            <Route path='/login' render={(props) => (<LoginPage onLogIn={this.handleLogIn.bind(this)} {...props} />)} />
          </div>
        </Router>
      </div>
    );
  }
}

export default withStyles(styles)(App);
