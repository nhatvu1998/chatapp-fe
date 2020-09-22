import React, {useEffect, useRef, useState} from 'react';
import {Button, Row} from "antd";
import {useMutation, useSubscription} from "@apollo/client";
import {useDispatch, useSelector} from "react-redux";
import {withRouter} from 'react-router-dom';
import {START_CALL, ACCEPT_CALL_USER} from "./queries";
import qs from 'query-string';
import io from "socket.io-client";

const Calling = (props) => {
  const token = window.localStorage.getItem('token');
  console.log(token)
  const userStream = useRef<any>();
  const peerRef = useRef<any>()
  const socketRef = useRef<any>()
  const currentUserId = useSelector<string>(state => state?.auth?.profile?._id);
  const otherUser = useRef();
  const userVideo = useRef<any>(null);
  const partnerVideo = useRef<any>(null);
  const [startCall] = useMutation(START_CALL)
  const {loading, data} = useSubscription(ACCEPT_CALL_USER)

  const peerId = qs.parse(props.location.search).peer_id

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
      userVideo.current.srcObject = stream;
      userStream.current = stream;
      socketRef.current = io.connect("http://172.15.197.170:4000", {query: {token}});
      socketRef.current.emit("join room", peerId);
      socketRef.current.on('other user', userID => {
        callUser(userID);
        otherUser.current = userID;
      });

      socketRef.current.on("user joined", userID => {
        otherUser.current = userID;
      });

      socketRef.current.on("offer", handleRecieveCall);

      socketRef.current.on("answer", handleAnswer);

      socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
    })
  }, [])

  function callUser(userID) {
    peerRef.current = createPeer(userID);
    userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
  }

  function createPeer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        },
      ]
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }

  function handleNegotiationNeededEvent(userID) {
    peerRef.current.createOffer().then(offer => {
      return peerRef.current.setLocalDescription(offer);
    }).then(() => {
      const payload = {
        target: userID,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      };
      socketRef.current.emit("offer", payload);
    }).catch(e => console.log(e));
  }

  function handleRecieveCall(incoming) {
    // @ts-ignore
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current.setRemoteDescription(desc).then(() => {
      userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }).then(() => {
      return peerRef.current.createAnswer();
    }).then(answer => {
      return peerRef.current.setLocalDescription(answer);
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      }
      socketRef.current.emit("answer", payload);
    })
  }

  function handleAnswer(message) {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      }
      socketRef.current.emit("ice-candidate", payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate)
      .catch(e => console.log(e));
  }

  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
  }

   return (
    <div style={{height: '100vh'}}>
      {
        partnerVideo && (
          <video width='100%' height='100%' playsInline style={{zIndex: 1, position: "absolute"}} ref={partnerVideo} autoPlay />
        )
      }
        <video width='250px' height='200px' style={{zIndex: 1000, position: "absolute", right: 0, bottom: 0}} playsInline muted ref={userVideo} autoPlay />
    </div>
  )
}

export default withRouter(Calling);
