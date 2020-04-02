import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { List, Button, Avatar, Row, Col, Card } from "antd";

import AppEmitter from "../../modules/events";
import RTC from "../../modules/RTC";
import RTCEventTypes from "../../modules/RTC/eventTypes";
import Socket from "../../modules/Socket";

class Rtc extends Component {
  constructor(props) {
    super(props);
    this.rtc = new RTC({ signalingChannel: AppEmitter });
    this.localVideoTag = React.createRef();
    this.remoteVideoTag = React.createRef();
    this.uuid = Date.now();
    this.state = {
      pendingCall: false,
      user: {
        id: this.uuid,
        name: `Test Name-${this.uuid}`,
      },
      users: []
    };
    this._subscribeToSocket();
  }

  componentDidMount() {
    Socket.emit("new_user", this.state.user);
    this.setState(state => ({
      users: state.users.concat({ name: "Your User", id: state.user.id, acceptCall: false })
    }));
  }

  componentWillUnmount() {
    Socket.emit("remove_user", { userId: this.state.user.id });
  }

  onNewUser({ user }) {
    if (_.isEmpty(user) || +user.id === this.state.user.id) {
      return;
    }
    this.setState(state => ({
        users: state.users.concat({ ...user, acceptCall: true })
      })
    );
  }

  onRemoveUser({ userId }) {
    this.setState(state => ({
        users: state.users.filter(({ id }) => id === userId)
      })
    );
  }

  async onCallClick({ target }) {
    const { userId } = target.dataset;
    this.setState({ pendingCall: true });
    const offer = await this.rtc.outgoingCall();
    Socket.emit("send_offer", { userId: Number(userId), offer });
    this.localVideoTag.current.srcObject = this.rtc.localStream;
  }

  async onRemoteAnswer({ answer }) {
    await this.rtc.onAnswerReceived({ answer });
  }

  // Handle incoming call
  async onRemoteOffer({ offer, userId }) {
    if (!this.state.pendingCall) {
      this.setState({ pendingCall: true });
      const answer = await this.rtc.incomingCall({ offer }); // start incoming call
      Socket.emit('send_answer', { answer, userId });
    }
  }

  async onRemoteIceCandidate({ iceCandidate }) {
    await this.rtc.onIceCandidateReceived({ candidate: iceCandidate });
  }

  async onLocalIceCandidate({ candidate }) {
    if (!this.isLocalIceReady) {
      this.isLocalIceReady = true;
      Socket.emit('send_ice_candidate', {
        iceCandidate: candidate
      });
    }

  }

  onRemoteStream({ stream }) {
    this.remoteVideoTag.current.srcObject = stream;
  }

  _subscribeToSocket() {
    // TODO handle remote user ID's
    Socket.on("offer", this.onRemoteOffer.bind(this));
    Socket.on("answer", this.onRemoteAnswer.bind(this));
    Socket.on("new_user", this.onNewUser.bind(this));
    Socket.on("remove_user", this.onRemoveUser.bind(this));
    Socket.on("ice_candidate", this.onRemoteIceCandidate.bind(this));

    AppEmitter.addListener(RTCEventTypes.REMOTE_STREAM, this.onRemoteStream, this);
    AppEmitter.addListener(RTCEventTypes.ICE_CANDIDATE, this.onLocalIceCandidate, this);
  }

  // eslint-disable-next-line class-methods-use-this
  renderListItem({ id, name, acceptCall }) {
    return (
      <List.Item
      >
        <List.Item.Meta
          avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>}
          title={`Username: ${name || id}`}
          description=""
        />
        <Button
          icon="phone"
          disabled={!acceptCall}
          data-user-id={id}
          onClick={this.onCallClick.bind(this)}>
          Call
        </Button>
      </List.Item>
    );
  }

  render() {
    /* eslint-disable jsx-a11y/media-has-caption */
    return (
      <div>
        <Row gutter={16}>
          <Col className="gutter-row" span={12}>
            <video ref={this.localVideoTag} className="h-w-100"/>
          </Col>
          <Col className="gutter-row" span={12}>
            <video ref={this.remoteVideoTag} className="h-w-100"/>
          </Col>
        </Row>
        <Card>
          <p>User List</p>
          <List
            loading={this.state.pendingCall}
            dataSource={this.state.users}
            renderItem={this.renderListItem.bind(this)}
          />
        </Card>
      </div>
    );
  }
}

Rtc.propTypes = {};

export default Rtc;