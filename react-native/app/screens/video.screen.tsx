import React, {ReactElement, useEffect, useState} from 'react';
import {Modal} from 'react-native';
import {HDVideoCall} from '@hellodoctor/react-native-sdk';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export default function VideoCallScreen(props): ReactElement {
    const { videoRoomSID, accessToken } = props.route.params;

    const [didEndVideoCall, setDidEndVideoCall] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    useEffect(() => {
        navigation.addListener('blur', handleOnEndCall);

        return () => {
            navigation.removeListener('blur', handleOnEndCall);
        };
    }, []);

    function handleOnEndCall() {
        setDidEndVideoCall(true);
    }

    return (
        <Modal visible={!didEndVideoCall}>
            <HDVideoCall
                accessToken={accessToken}
                videoRoomSID={videoRoomSID}
                onEndCall={handleOnEndCall}
            />
        </Modal>
    );
}
