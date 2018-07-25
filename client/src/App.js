import React, { Component } from 'react';
import uuid from 'uuid';
import $ from 'jquery';
// import Projects from './Components/Projects';
// import AddProject from './Components/AddProject';
// import Todos from './Components/Todos';
import './App.css';
import UserRegistrationForm from './Components/UserRegistrationForm/UserRegistrationForm';
import { Grid, Paper, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AdminSection from './Components/AdminSection/AdminSection';

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

const Child = ({ match }) => (
  <div>
    <h3>Kode: {match.params.code}</h3>
    <p>Her kjører vi en spørring som sjekker om det finnes et element i databasen som matcher koden og brukernavnet.</p>
    <p>Kanskje vi burde sjekke opp mot NTNU om brukeren er tilknyttet instituttet.</p>
  </div>
);

class App extends Component {
  constructor() {
    super();
    this.state = {
      projects: [],
      todos: []
    };
  }

  getTodos() {
    $.ajax({
      url: 'https://jsonplaceholder.typicode.com/todos',
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({ todos: data }, function () {
          // console.log(this.state);
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(err);
      }
    });
  }

  getProjects() {
    this.setState({
      projects: [{
        id: uuid.v4(),
        title: 'Business Website',
        category: 'Web Design'
      },
      {
        id: uuid.v4(),
        title: 'Social App',
        category: 'Mobile Development'
      },
      {
        id: uuid.v4(),
        title: 'Ecommerce Shopping Card',
        category: 'Web Development'
      }]
    });
  }

  componentWillMount() {
    this.getProjects();
    this.getTodos();
  }

  componentDidMount() {
    this.getTodos();
  }

  handleAddProject(project) {
    let projects = this.state.projects;
    projects.push(project);
    this.setState({ projects: projects });
  }

  handleDeleteProject(id) {
    let projects = this.state.projects;
    let index = projects.findIndex(x => x.id === id);
    projects.splice(index, 1);
    this.setState({ projects: projects });
  }

  render() {
    const { classes } = this.props;

    return (
      // <div className="App">
      //     <AddProject addProject={this.handleAddProject.bind(this)} />
      //     <Projects projects={this.state.projects} onDelete={this.handleDeleteProject.bind(this)} />
      //     <hr />
      //     <Todos todos={this.state.todos} />
      // </div>

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
                        <Link to="/confirm/asdf1234_brukernavn">Bekrefte epost</Link>
                      </li>
                      <li>
                        <Link to="/admin">Admin</Link>
                      </li>
                    </ul>
                  </Paper>
                </div>
              </Grid>
              <Grid item xs={10}>
              </Grid>
            </Grid>
            <br />
            <Route path="/" exact component={UserRegistrationForm} />
            <Route path="/confirm/:code" exact component={Child} />
            <Route path="/admin" exact component={AdminSection} />
          </div>
        </Router>
      </div>
    );
  }
}

export default withStyles(styles)(App);
