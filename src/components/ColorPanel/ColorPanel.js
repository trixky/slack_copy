import React, { Component } from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions';

import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';

class ColorPanel extends Component {
	state = {
		modal: false,
		primary: '#4045bf',
		secondary: '#4045bf',
		user: this.props.currentUser,
		userRef: firebase.database().ref('users'),
		userColors: []
	}

	componentDidMount() {
		if (this.state.user) {
			this.addListener(this.state.user.uid);
		}
	}

	componentWillUnmount() {
		this.removeListener();
	}

	removeListener = _ => {
		this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
	}

	addListener = userId => {
		let userColors = [];

		this.state.userRef
			.child(`${userId}/colors`)
			.on('child_added', snap => {
				userColors.unshift(snap.val());
				this.setState({ userColors })
			});
	}

	chandleChangePrimary = color => this.setState({ primary: color.hex });
	chandleChangeSecondary = color => this.setState({ secondary: color.hex });

	handleSaveColors = _ => {
		const { primary, secondary } = this.state;
		if (primary && secondary) {
			this.saveColors(primary, secondary);
		}
	}

	saveColors = (primary, secondary) => {
		this.state.userRef
			.child(`${this.state.user.uid}/colors`)
			.push()
			.update({
				primary,
				secondary
			})
			.then(_ => {
				this.closeModal();
			})
			.catch(err => {
				console.error(err);
				this.closeModal();
			})
	}

	displayUserColors = colors => (
		colors.length > 0 && colors.map((color, index) => (
			<React.Fragment key={index}>
				<Divider />
				<div
					className="color__container"
					onClick={_ => this.props.setColors(color.primary, color.secondary)}
				>
					<div className="color__square" style={{ background: color.primary }}>
						<div className="color__overlay" style={{ background: color.secondary }}>

						</div>
					</div>
				</div>
			</React.Fragment>
		))
	)

	openModal = _ => this.setState({ modal: true });
	closeModal = _ => this.setState({ modal: false });

	render() {
		const { modal, primary, secondary, userColors } = this.state;

		return (
			<Sidebar
				as={Menu}
				icon="labeled"
				inverted
				vertical
				visible
				width="very thin">

				<Divider />
				<Button icon="add" size="small" color="blue" onClick={this.openModal} />
				{this.displayUserColors(userColors)}

				{/* Color Picker Modal */}
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>Choose App Colors	</Modal.Header>
					<Modal.Content>
						<Segment inverted>
							<Label content="Primary Color" />
							<SliderPicker
								color={primary}
								onChange={this.chandleChangePrimary}
							/>
						</Segment>
						<Segment inverted>
							<Label content="Secondatry Color" />
							<SliderPicker
								color={secondary}
								onChange={this.chandleChangeSecondary}
							/>
						</Segment>
					</Modal.Content>
					<Modal.Actions>
						<Button color="green" inverted onClick={this.handleSaveColors}>
							<Icon name="checkmark" /> Save Colors
						</Button>
						<Button color="red" inverted onClick={this.closeModal}>
							<Icon name="remove" /> Cancel
						</Button>
					</Modal.Actions>
				</Modal>
			</Sidebar>
		)
	}
}

export default connect(
	null,
	{ setColors }
)(ColorPanel)