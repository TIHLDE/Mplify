import {Paper} from '@material-ui/core';
import {createTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import React, {Component} from 'react';
import {HashRouter as Router, Redirect, Route} from "react-router-dom";
import './App.css';
import AdminPage from './Components/AdminPage/AdminPage';
import AwaitingConfirmationPage from './Components/AwaitingConfirmationPage/AwaitingConfirmationPage';
import ConfirmEmailPage from './Components/ConfirmEmailPage/ConfirmEmailPage';
import LoginPage from './Components/LoginPage/LoginPage';
import RegistrationPage from './Components/RegistrationPage/RegistrationPage';
import LOGO from './Images/SALT.png';
import MembershipCertificatePage from "./Components/MembershipCertificatePage/MembershipCertificatePage";

const styles = theme => ({
  root: {
    textAlign: "center"
  },
  paper: {
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    maxWidth: 275,
  }
});

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#b71c1c' },
    error: { main: '#db9020' }
  },
  typography: {
    useNextVariants: true,
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

const PrivateRoute = ({ children }) => {
  if (!authController.isAuthenticated) {
    return <Redirect to={{ pathname: "/login"}} />
  }

  return children
};

const ConfirmEmail = ({ match }) => (
  <ConfirmEmailPage match={match} />
);

class App extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
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
              <Route path="/" exact render={() => <Redirect to='/membership-certificate' />} />
              <Route path="/membership-certificate" exact component={() => <MembershipCertificatePage/>} />
              <Route path="/registration" exact component={(props) => <RegistrationPage {...props}/>} />
              <Route path="/awaiting-confirmation" exact component={() => <AwaitingConfirmationPage/>} />

              <Route path="/confirm/:code" exact component={(props) => <ConfirmEmailPage{...props}/>} />

              <Route path='/admin' exact component={() =>
                <PrivateRoute>
                  <AdminPage onLogout={this.handleLogout.bind(this)} />
                </PrivateRoute>
              } />

              <Route path='/login' component={() => <LoginPage onLogIn={this.handleLogIn.bind(this)} />} />
          </Router>
        </MuiThemeProvider>
      </div>
    );
  }
}
export default withStyles(styles)(App);
