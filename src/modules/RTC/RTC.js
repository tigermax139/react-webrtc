import './mixins';

import _ from 'lodash';

import eventTypes from './eventTypes';
import { RTCError, RTCErrorCodes } from './errors';

const defaultConfig = {
  iceServers: [
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.1.google.com:19302' },
    {
      urls: 'turn:numb.viagenie.ca:3478',
      'credential': 'password123456',
      'username': 'tigermax139@gmail.com'
    }
  ],
};

export const callTypes = {
  incoming: 'incoming',
  outgoing: 'outgoing'
};

class RTC {
  constructor({ signalingChannel }) {
    this.signalingChannel = signalingChannel;
    this.pc = new RTCPeerConnection(defaultConfig);
    this.localStream = null;

    this.signalingChannel.emit(eventTypes.INITIALIZED);
    this._initEvents();
    console.log('constructor');
  }

  _initEvents() {
    console.log('_initEvents');
    this.pc.onicecandidate = this.onIceCandidateReady.bind(this);
    this.pc.onaddstream = this.onAddStream.bind(this);

    this.signalingChannel.addListener(eventTypes.ANSWER_RECEIVED, this.onAnswerReceived, this);
    this.signalingChannel.addListener(eventTypes.ICE_CANDIDATE_RECEIVED, this.onIceCandidateReceived, this);
  }

  // Method for receive stream from user and set to RTConnection
  async useLocalStream({ ensureUserMedia } = { ensureUserMedia: () => true }) {
    console.log('useLocalStream');
    // ensureUserMedia custom func which should call before native access to user media.
    // E.g. custom confirm popout
    if (!await ensureUserMedia()) {
      throw new RTCError({ code: RTCErrorCodes.USER_MEDIA_NOT_ALLOWED });
    }

    // get stream from camera
    try {
      this.localStream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
    } catch (e) {
      console.error(e);
      throw new RTCError({ code: RTCErrorCodes.USER_MEDIA_NOT_ALLOWED });
    }

    this.signalingChannel.emit(eventTypes.LOCAL_STREAM, { stream: this.localStream });

    // addStream method received from webrtc-adapter
    this.pc.addStream(this.localStream);

    return this;
  }

  resetLocalStream() {
    this.localStream = null;
    return this;
  }

  // Handle outgoing call -> create offer
  async outgoingCall() {
    console.log('outgoingCall');
    if (!this.localStream) {
      await this.useLocalStream();
    }
    const offer = await this.pc.createOffer({});
    await this.pc.setLocalDescription(offer);
    this.signalingChannel.emit(eventTypes.OFFER, { offer });
    return offer;
  }

  // Handle incoming call -> create answer
  async incomingCall({ offer }) {
    console.log('incomingCall');
    if (!this.localStream) {
      await this.useLocalStream();
    }
    await this.onOfferReceived({ offer }); // apply remote offer
    const answer = await this.pc.createAnswer({});
    await this.pc.setLocalDescription(answer);
    this.signalingChannel.emit(eventTypes.ANSWER, { answer });
    return answer;
  }


  /* # Handlers # */
  // Handle local IceCandidate
  onIceCandidateReady({ candidate }) {
    console.log('onIceCandidateReady');
    this.signalingChannel.emit(eventTypes.ICE_CANDIDATE, { candidate });
  }

  // Handle remote IceCandidate
  async onIceCandidateReceived({ candidate }) {
    console.log('onIceCandidateReceived');
    if (this.remoteIceCandidateAdded) return;
    this.remoteIceCandidateAdded = true;
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));

    this.signalingChannel.emit(eventTypes.ICE_CANDIDATE_RECEIVED, { candidate });
  }

  // Handle receive remote stream
  onAddStream({ stream }) {
    console.log('onAddStream');
    this.signalingChannel.emit(eventTypes.REMOTE_STREAM, { stream });
  }

  // Handle remote answer
  async onAnswerReceived({ answer }) {
    console.log('onAnswerReceived');
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    this.signalingChannel.emit(eventTypes.ANSWER, { answer });
  }

  async onOfferReceived({ offer }) {
    console.log('onOfferReceived');
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    this.signalingChannel.emit(eventTypes.OFFER, { offer });
  }

}

export default RTC;
