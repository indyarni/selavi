const React = require('react');
import { connect } from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import TextField from "material-ui/TextField";
import CircularProgress from 'material-ui/CircularProgress';

import {onCancel, onSubmit} from './../actions/loginDialogActions';

const mapStateToProps = (state) => {
    return {
        menuMode: state.menuMode,
        loginErrorMessage: state.loginErrorMessage
    };
};

const mapDispatchToProps = {
    onCancel,
    onSubmit
};

export class LoginDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {inProgress: false};
    }

    componentWillMount() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && this.props.menuMode === 'LOGIN' && !this.state.inProgress) {
                this.onSubmit();
            }
        }, false);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.menuMode === 'LOGIN' && nextProps.menuMode != 'LOGIN') {
            this.setState({inProgress: false});
        }
    }

    onSubmit() {
        this.setState({inProgress: true});

        const params = {
            entity: {
                username: this.refs.input_username.getValue(),
                password: this.refs.input_password.getValue()
            }
        }

        this.props.onSubmit(params);
    }

    render() {

        const actions = [
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={this.props.onCancel.bind(this)}
                disabled={this.state.inProgress}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.onSubmit.bind(this)}
                disabled={this.state.inProgress}
            />,
        ];

        var isOpen = false;
        var isErrorMessageOpen = false;
        var errorMessage = "";

        if (this.props.menuMode === 'LOGIN') {
            isOpen = true;
            if (this.props.loginErrorMessage) {
                isErrorMessageOpen = true;
                errorMessage = this.props.loginErrorMessage;
            }
        }

        let textFieldStyle = {marginLeft: "1em"};

        let spinner = undefined;

        if (this.state.inProgress) {
            spinner = <CircularProgress size={60} thickness={7} style={{zIndex: 999, position: 'absolute', left: 'calc(50% - 30px)', top: 'calc(50% - 30px)'}}/>
        }

        return (
            <div>
                <Dialog
                    title="Login to SeLaVi"
                    actions={actions}
                    modal={true}
                    open={isOpen}>
                    <TextField ref="input_username"
                               floatingLabelText="Username"
                               hintText="Username"
                               style={textFieldStyle}
                               disabled={this.state.inProgress}/>
                    <TextField ref="input_password"
                               floatingLabelText="Password"
                               hintText="Password"
                               type="password"
                               style={textFieldStyle}
                               disabled={this.state.inProgress}/>
                    {spinner}
                </Dialog>
                <Snackbar
                    open={isErrorMessageOpen}
                    message={errorMessage}
                    autoHideDuration={0}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (LoginDialog);