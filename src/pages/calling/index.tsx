import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import qs from "query-string";
import { socket } from "../../tools/apollo/index";
import "./index.scss";
import { FaMicrophoneSlash, FaMicrophone, FaPhoneAlt, FaVideoSlash, FaVideo } from 'react-icons/fa';
import { FiMonitor } from 'react-icons/fi';
import { Row, Space } from "antd";

const Calling = (props) => {
  const [isOnAudio, setIsOnAudio] = useState(true);
  const [isOnVideo, setIsOnVideo] = useState(true);
  const [isOnShareScreen, setIsOnShareScreen] = useState(false);
  const userStream = useRef<any>();
  const peerRef = useRef<any>();
  const otherUser = useRef();
  const userVideo = useRef<any>(null);
  const partnerVideo = useRef<any>(null);

  const peerId = qs.parse(props.location.search).peer_id;

  useEffect(() => {
    // @ts-ignores
    navigator.mediaDevices
      .getUserMedia({ video: isOnVideo, audio: isOnAudio })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;

        socket.emit("join room", peerId);
        socket.emit("call-signal", peerId);
        socket.on("other user", (userID) => {
          callUser(userID);
          otherUser.current = userID;
        });

        socket.on("user joined", (userID) => {
          otherUser.current = userID;
        });

        socket.on("offer", handleReceiveCall);

        socket.on("answer", handleAnswer);

        socket.on("ice-candidate", handleNewICECandidateMsg);
      })
  }, [])

  useEffect(() => {
    socket.on('end-call', () => {
      window.close()
    })
  }, [])

  useEffect(()=>{
    const cancelElm = document.querySelector('.cancelCall') as HTMLElement;
    if(cancelElm.style.display) {
      setTimeout(()=>{
        cancelElm.style.display = 'none';
      }, 3000)
    }
  });

  // useEffect(() => {
  //   const callScreen = document.querySelector("#callScreen");
  //   if (callScreen) {
  //     callScreen.addEventListener("mousemove", (e) => {
  //       const cancelElm = document.querySelector(".cancelCall");
  //       if (cancelElm) {
  //         // @ts-ignore
  //         cancelElm.style.display = "block";
  //       }
  //     });
  //   }
  // });

  const callUser = (userID) => {
    peerRef.current = createPeer(userID);
    userStream.current
      .getTracks()
      .forEach((track) => peerRef.current.addTrack(track, userStream.current));
  };

  const createPeer = (userID) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    console.log(peer);

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onconnectionstatechange = function (event) {
      console.log(peer.connectionState);
      switch (peer.connectionState) {
        case "connected":
          console.log("connected");
          break;
        case "disconnected":
        case "failed":
          partnerVideo.current.srcObject = null;
          peerRef.current.close();
          window.close();
          break;
        case "closed":
          break;
      }
    };
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  };

  const handleNegotiationNeededEvent = (userID) => {
    peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socket.id,
          sdp: peerRef.current.localDescription,
        };
        socket.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  };

  const handleReceiveCall = (incoming) => {
    // @ts-ignore
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          .getTracks()
          .forEach((track) =>
            peerRef.current.addTrack(track, userStream.current)
          );
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socket.id,
          sdp: peerRef.current.localDescription,
        };
        socket.emit("answer", payload);
      });
  };

  const handleAnswer = (message) => {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleICECandidateEvent = (e) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socket.emit("ice-candidate", payload);
    }
  };

  const handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  };

  const handleTrackEvent = (e) => {
    console.log(e);
    partnerVideo.current.srcObject = e.streams[0];
  };

  // console.log(peerRef);
  const handleExitCall = () => {
    // const senders = peerRef.current.getSenders();
    // senders.forEach((sender) => userStream.current.removeTrack(sender, userStream.current));
    console.log('abc');
    
    // socket.emit('end-call', {peerId, target: otherUser.current })
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onremovetrack = null;
      peerRef.current.onremovestream = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.onsignalingstatechange = null;
      peerRef.current.onicegatheringstatechange = null;
      peerRef.current.onnegotiationneeded = null;
      peerRef.current.close()
      
      socket.emit('end-call', {peerId, target: otherUser.current }, function(confirmation){
        window.close();
      })
    }
    // socket.emit('end-call', {peerId, target: otherUser.current })
  }

  const toggleAudio = () => {
    userStream.current.getAudioTracks()[0].enabled = !isOnAudio;
    setIsOnAudio(!isOnAudio);
  };

  const toggleVideo = () => {
    userStream.current.getVideoTracks()[0].enabled = !isOnVideo;
    setIsOnVideo(!isOnVideo);
  };

  const shareScreen = () => {
    if (!isOnShareScreen) {
      // @ts-ignore
      navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        let videoTrack = stream.getVideoTracks()[0];
        userVideo.current.srcObject = stream;
        userStream.current = stream;
        const senders = peerRef.current
          .getSenders()
          .find((s) => s.track.kind === videoTrack.kind);
        console.log(senders);
        senders.replaceTrack(videoTrack);
      });
      setIsOnShareScreen((isOnShareScreen) => !isOnShareScreen);
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          let videoTrack = stream.getVideoTracks()[0];
          userVideo.current.srcObject = stream;
          userStream.current = stream;
          const senders = peerRef.current
            .getSenders()
            .find((s) => s.track.kind === videoTrack.kind);
          console.log(senders);
          senders.replaceTrack(videoTrack);
        });
      setIsOnShareScreen((isOnShareScreen) => !isOnShareScreen);
    }
  };

  return (
    <div id="callScreen">
      {partnerVideo && (
        <video id="partnerVideo" playsInline ref={partnerVideo} autoPlay />
      )}
      <video id="myVideo" playsInline muted ref={userVideo} autoPlay />
      <Row className={"cancelCall"} style={{ marginBottom: '10px' }}>
        <Space>
          <span className="button-action" style={{ backgroundColor: 'red' }} onClick={() => handleExitCall()} >
            <FaPhoneAlt size={20} fill="#fff" />
          </span>
          <span className="button-action" onClick={() => shareScreen()} >
            <FiMonitor size={20} fill="#fff" />
          </span>
          <span className="button-action" onClick={() => toggleAudio()}>
            {isOnAudio ? <FaMicrophone size={20} fill="#fff" /> : <FaMicrophoneSlash size={20} fill="#fff" /> }
          </span>
          <span className="button-action" onClick={() => toggleVideo()}>
            {isOnVideo ? <FaVideo size={20} fill="#fff" /> : <FaVideoSlash size={20} fill="#fff" />}
          </span>
        </Space>
      </Row>
    </div>
  );
};

export default withRouter(Calling);
