import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@material-ui/core';
import Info from '@material-ui/icons/Info';
import { Component, default as React } from 'react';

class VippsInfo extends Component {

    constructor() {
        super();
        this.state = {
            vippsInfoDialogOpen: false
        };
    }

    handleDialogClose = () => {
        this.setState({
            vippsInfoDialogOpen: false
        });
    }

    handleVippsInfoDialogOpen = () => {
        this.setState({
            vippsInfoDialogOpen: true
        });
    }

    render() {
        const vippsInfoDialog = (
            <Dialog
                open={this.state.vippsInfoDialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">Vipps - Spørsmål og svar</DialogTitle>
                <DialogContent>
                    <h3>Jeg har ikke betalt medlemsavgiften min enda, kan jeg fortsatt registrere meg?</h3>
                    <DialogContentText>
                        Ja, du kan kan registrere deg uten en Vipps transaksjons-id, men det er best å gjøre det med én gang.
                    </DialogContentText>
                    <DialogContentText>
                        Dersom du registrerer deg uten, må du i etterkant av å ha betalt medlemsavgiften sende en epost til postmottak@studentalt.no.
                    </DialogContentText>
                    <DialogContentText>
                        Eposten må inneholde hvem du er, din studentepost og et skjermbilde av Vipps-kvitteringen din.
                    </DialogContentText>

                    <h3>Hvor finner jeg min Vipps transaksjons-id?</h3>
                    <DialogContentText>
                        Inne i Vipps-appen, trykk på handlevogn-ikonet nederst til høyre.
                    </DialogContentText>
                    <DialogContentText>
                        På siden for betalingshistorikk, velg Studentforeningen SALT.
                    </DialogContentText>
                    <DialogContentText>
                        Trykk på kvitteringen for betalt registreringsavgift.
                    </DialogContentText>
                    <DialogContentText>
                        Her vil din 10-sifrede transaksjons-id være listet ut.
                    </DialogContentText>

                    <h3>Jeg får beskjed om at min transaksjons-id allerede er i bruk, hva gjør jeg?</h3>
                    <DialogContentText>
                        Din transaksjons-id har allerede blitt brukt i en annen registrering.
                    </DialogContentText>
                    <DialogContentText>
                        Register deg uten uten din transaksjons-id,
                        og send en epost til postmottak@studentalt.no hvor du oppgir din hvem du er,
                        og legger ved din student-epost og skjermbilde av din kvittering.
                        Opplys om at noen andre har brukt din transaksjons-id.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">Lukk</Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div>
                <IconButton
                    aria-label="Show Vipps info"
                    onClick={this.handleVippsInfoDialogOpen}
                >
                    <Info />
                </IconButton>
                {vippsInfoDialog}
            </div>
        );
    }
}

export default VippsInfo;
