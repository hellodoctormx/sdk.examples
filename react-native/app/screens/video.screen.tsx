import React, {ReactElement, useState} from 'react';
import {Modal} from 'react-native';
import {HDVideoCall} from '@hellodoctor/react-native-sdk';

export default function VideoCallScreen(props): ReactElement {
    const { videoRoomSID, accessToken } = props.route.params;

    const [didEndVideoCall, setDidEndVideoCall] = useState(false);

    return (
        <Modal visible={!didEndVideoCall}>
            <HDVideoCall accessToken={accessToken} videoRoomSID={videoRoomSID} onEndCall={() => setDidEndVideoCall(true)} />
        </Modal>
    );
}
