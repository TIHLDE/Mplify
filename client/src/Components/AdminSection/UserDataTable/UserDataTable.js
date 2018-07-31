import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import MUIDataTable from 'mui-datatables';
import React, { Component } from 'react';
import { isUndefined } from 'util';

const styles = theme => ({
    root: {
        textAlign: "left"
    },
    buttonContainer: {
        display: "flex"
    },
    button: {
        display: "inline-flex"
    },
});

class UserDataTable extends Component {
    constructor() {
        super();
        //TODO: Hente members og studyProgrammes fra database
        this.state = {
            // members: [
            //     { id: 1, firstName: 'Gard', lastName: 'Steinsvik', studentEmail: 'gardste@stud.ntnu.no', privateEmail: 'gardsteinsvik@gmail.com', yearOfAdmission: 2015, active: 0, newsletter: 0, vippsTransactionId: null, studyProgrammeId: 2 },
            //     { id: 2, firstName: 'Gard', lastName: 'Steinsvik', studentEmail: 'gardste@stud.ntnu.no', privateEmail: 'gardsteinsvik@gmail.com', yearOfAdmission: 2015, active: 0, newsletter: 1, vippsTransactionId: 1234, studyProgrammeId: 1 }
            // ],
            members: [],
            studyProgrammes: [
                { id: 1, programmeid: 'MGLU1-7', name: 'Grunnskolelærerutdanning 1.–7. trinn', length: 5 },
                { id: 2, programmeid: 'LTMAGMA1', name: 'Matematikkdidaktikk 1.–7. trinn', length: 3 }
            ]
        };
    }

    componentDidMount() {
        fetch('http://localhost:8080/api/allusers')
            .then((resp) => resp.json())
            .then(
                (data) => {
                    console.log(this.state);
                    console.log(data);
                    // data.forEach(member => this.state.members.push(member));
                    
                }
            )
            .catch(
                (error) => {
                    console.log(error);
                }
            );
    }

    handleEditClick = (id) => {
        console.log('Edit ' + id);
    }

    handleDeleteClick = (id) => {
        console.log('Delete ' + id);
    }

    formatTableRow(m) {
        const { classes } = this.props;
        const editButton = <IconButton className={classes.button} color="primary" onClick={this.handleEditClick.bind(this, m.id)}><Edit /></IconButton>;
        const deleteButton = <IconButton className={classes.button} color="secondary" onClick={this.handleDeleteClick.bind(this, m.id)}><Delete /></IconButton>;
        const actions = <div className={classes.buttonContainer}>{editButton}{deleteButton}</div>
        const active = m.active ? 'Ja' : 'Nei';
        const studyProgramme = this.state.studyProgrammes.find(sp => sp.id === m.studyProgrammeId);
        const studyProgrammeName = studyProgramme != null ? studyProgramme.programmeid : '';
        const newsletter = m.newsletter ? 'Ja' : 'Nei';
        const vippsTransactionId = m.vippsTransactionId == null ? '' : m.vippsTransactionId;
        return [actions, active, m.id, m.firstName, m.lastName, m.studentEmail, m.privateEmail, m.yearOfAdmission, studyProgrammeName, newsletter, vippsTransactionId];
    }

    render() {
        const { classes } = this.props;

        const columns = [
            { name: 'Handlinger', options: { filter: false, display: true, sort: false } },
            { name: 'Aktiv', options: { filter: true, display: true } },
            { name: 'ID', options: { filter: false, display: false } },
            { name: 'Fornavn', options: { filter: false, display: true } },
            { name: 'Etternavn', options: { filter: false, display: true } },
            { name: 'Stud.epost', options: { filter: false, display: true } },
            { name: 'Priv.epost', options: { filter: false, display: true } },
            { name: 'Studiestart', options: { filter: true, display: true } },
            { name: 'Linje', options: { filter: true, display: true } },
            { name: 'Nyhetsbrev', options: { filter: true, display: true } },
            { name: 'Vipps', options: { filter: false, display: true } },
        ]

        const data = [];

        this.state.members.forEach(
            m => data.push(this.formatTableRow(m))
        );

        const options = {
            print: false,
            filterType: 'checkbox',
            selectableRows: false,
            textLabels: {
                body: {
                    noMatch: "Klarte ikke å finne noen elementer",
                    toolTip: "Sortér",
                },
                pagination: {
                    next: "Neste side",
                    previous: "Forrige side",
                    rowsPerPage: "Rader per side:",
                    displayRows: "av",
                },
                toolbar: {
                    search: "Søk",
                    downloadCsv: "Last ned CSV",
                    print: "Print",
                    viewColumns: "Se kolonner",
                    filterTable: "Filtrer tabell",
                },
                filter: {
                    all: "Alle",
                    title: "FILTERE",
                    reset: "TILBAKESTILL",
                },
                viewColumns: {
                    title: "Vis kolonner",
                    titleAria: "Vis/skjul tabellkolonner",
                },
                selectedRows: {
                    text: "rad(er) valgt",
                    delete: "Slett",
                    deleteAria: "Slett valgt rad",
                },
            }
        };

        return (
            <div className={classes.root}>
                <MUIDataTable
                    title={'Registreringer'}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </div>
        );
    }
}

export default withStyles(styles)(UserDataTable);
