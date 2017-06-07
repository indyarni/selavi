const React = require('react');
import { connect } from 'react-redux';

const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import SentimentNeutralIcon from 'material-ui/svg-icons/social/sentiment-neutral';
import SentimentVerySatisfiedIcon from 'material-ui/svg-icons/social/sentiment-very-satisfied';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';

const mapStateToProps = (state) => {
    return {
        menuMode: state.menuMode,
        loggedInUser: state.loggedInUser
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onType: function(eventProxy, value) {
            dispatch({
                type: 'FILTERBOX_TYPE',
                filterString: value
            });
        },
        onLogin: function() {
            dispatch({
                type: 'LOGIN',
            });
        },
        onLogout: function() {
            var request = {
                method: 'POST',
                path: '/selavi/logout'
            }

            var client = rest.wrap(mime).wrap(errorCode);
            client(request).then(response => {
                dispatch({
                    type: 'LOGOUT_SUCCESS'
                });
            }, response => {
                dispatch({
                    type: 'LOGOUT_FAILED',
                    message: response.entity.message
                });
            });
        },
        onAddLink: function() {
            dispatch({
                type: 'ADD_LINK',
            });
        },
        onAddService: function() {
            dispatch({
                type: 'ADD_SERVICE',
            });
        },
        onCancel: function() {
            dispatch({
                type: 'CANCEL_MENU_ACTION',
            });
        }
    };
};

export class MicroserviceFilterbox extends React.Component {
    render() {

        var avatarToolGroup;
        const avatarStyle = {margin: 5};

        var loginLogoutMenuItem;
        var addServiceMenuItem;
        var linkMenuItem;

        if (this.props.loggedInUser) {
            avatarToolGroup = (<ToolbarGroup>
                <Avatar icon={<SentimentVerySatisfiedIcon/>} style={avatarStyle}/>{this.props.loggedInUser}
            </ToolbarGroup>);

            loginLogoutMenuItem = (<MenuItem primaryText="Logout" onTouchTap={this.props.onLogout.bind(this)} />);

            if (this.props.menuMode === 'ADD_LINK') {
                linkMenuItem = (<MenuItem primaryText="Cancel add link" onTouchTap={this.props.onCancel.bind(this)} />);
            } else {
                linkMenuItem = (<MenuItem primaryText="Add link" onTouchTap={this.props.onAddLink.bind(this)} />);
            }

            addServiceMenuItem = (<MenuItem primaryText="Add Service" onTouchTap={this.props.onAddService.bind(this)} />);
        } else {
            avatarToolGroup = (<ToolbarGroup>
                <Avatar icon={<SentimentNeutralIcon/>} style={avatarStyle}/>Not logged in
            </ToolbarGroup>);

            loginLogoutMenuItem = (<MenuItem primaryText="Login" onTouchTap={this.props.onLogin.bind(this)} />);
        }

        return (
            <Toolbar>
                {avatarToolGroup}
                <ToolbarGroup>
                    <ToolbarTitle text="SeLaVi - Service Landscape Visualizer" />
                </ToolbarGroup>
                <ToolbarGroup>
                    <TextField hintText="Filter services..." onChange={this.props.onType.bind(this)}></TextField>
                </ToolbarGroup>
                <ToolbarGroup>
                    <IconMenu iconButtonElement={<IconButton touch={true}><NavigationExpandMoreIcon /></IconButton>}>
                        {loginLogoutMenuItem}
                        {addServiceMenuItem}
                        {linkMenuItem}
                    </IconMenu>
                </ToolbarGroup>
            </Toolbar>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps) (MicroserviceFilterbox);