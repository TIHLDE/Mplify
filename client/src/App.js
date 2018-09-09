import {Paper} from '@material-ui/core';
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import React, {Component} from 'react';
import {HashRouter as Router, Redirect, Route} from "react-router-dom";
import './App.css';
import AdminPage from './Components/AdminPage/AdminPage';
import AwaitingConfirmationPage from './Components/AwaitingConfirmationPage/AwaitingConfirmationPage';
import ConfirmEmailPage from './Components/ConfirmEmailPage/ConfirmEmailPage';
import LoginPage from './Components/LoginPage/LoginPage';
import RegistrationPage from './Components/RegistrationPage/RegistrationPage';
import LOGO from './‫Images/SALT.png';
import MembershipCertificatePage from "./Components/MembershipCertificatePage/MembershipCertificatePage";

const styles = theme => ({
  root: {
    textAlign: "center"
  },
  paper: {
    paddingTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    maxWidth: 275,
  }
});

const theme = createMuiTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#b71c1c' },
    error: { main: '#db9020' }
  },
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
  };

  handleLogout = () => {
    authController.signout();
  };

  render() {
    const { classes } = this.props;

    return (
      <div className="App">
        <MuiThemeProvider theme={theme}>
          <Paper className={classes.paper} >
            <img onClick={this.handleImageClick} src={LOGO} height="128px" alt="" />
          </Paper>
          <Router>
            <div>
              <Route path="/" exact component={MembershipCertificatePage} />
              <Route path="/registration" exact component={RegistrationPage} />
              <Route path="/awaiting-confirmation" exact component={AwaitingConfirmationPage} />
              <Route path="/confirm/:code" exact component={ConfirmEmail} />
              <PrivateRoute path="/admin" exact component={AdminPage} onLogout={this.handleLogout.bind(this)} />
              <Route path='/login' render={(props) => (<LoginPage onLogIn={this.handleLogIn.bind(this)} {...props} />)} />
            </div>
          </Router>
        </MuiThemeProvider>
      </div>
    );
  }
}
export default withStyles(styles)(App);
