import {Platform} from 'react-native';
import {RNHelloDoctor} from '@hellodoctor/react-native-sdk';
import notifee from '@notifee/react-native';

// @ts-ignore
import {name as appName} from '../../app.json';
import * as rootNavigation from './navigation';
import {navigateToHome} from './navigation';
import {setInitialNavigation} from '../notifications';
import {getDeviceSnapshot} from './device';
import {getCurrentUser} from '../services/user.service';
import {API_KEY, HELLO_DOCTOR_API_HOST} from '../../app.config.js';

let _didNavigateToVideoCall = false;

export async function configureHelloDoctorSDK(): Promise<void> {
    const currentUser = getCurrentUser();

    const config = {
        apiKey: API_KEY,
        appName: appName,
        serviceHost: HELLO_DOCTOR_API_HOST,
        onAnswerCall: navigateToVideoCall,
        onEndCall: navigateToHome,
        ios: {
            onRegisterPushKitToken: registerPushKitToken,
        },
    };

    await RNHelloDoctor.configure(config);
    await RNHelloDoctor.signIn(currentUser.helloDoctorUserID, currentUser.refreshToken);
}

async function registerPushKitToken(token: string): Promise<void> {
    console.debug('[registerPushKitToken]', {token});

    const deviceSnapshot = await getDeviceSnapshot();
    await deviceSnapshot.ref.update({apnsToken: token});
}

export async function handleIncomingVideoCallNotification(
    videoRoomSID: string,
    callerDisplayName: string,
    callerPhotoURL: string,
    consultationID: string,
) {
    if (Platform.OS === 'android') {
        await configureHelloDoctorSDK();
        await RNHelloDoctor.handleIncomingVideoCallNotification({
            videoRoomSID,
            callerDisplayName,
            callerPhotoURL,
        });

        setInitialNavigation('Consultation', {consultationID});
    }
}

export async function handleVideoCallEndedNotification(videoRoomSID: string) {
    try {
        await RNHelloDoctor.handleVideoCallEndedNotification(videoRoomSID);
    } catch (error: any) {
        if (error.message === 'missed_call') {
            const missedCallNotification = {title: 'Llamada perdida de HelloDoctor'};

            return notifee
                .displayNotification(missedCallNotification)
                .then(() => notifee.incrementBadgeCount());
        } else {
            console.warn('[handleVideoCallEndedNotification:ERROR]', {error});
        }
    }
}

export function checkDidNavigateToVideoCall() {
    return _didNavigateToVideoCall;
}

export function setDidNavigateToVideoCall(didNavigateToVideoCall: boolean) {
    _didNavigateToVideoCall = didNavigateToVideoCall;
}

export async function navigateToVideoCall(consultationID: string, videoRoomSID: string) {
    console.debug('[navigateToVideoCall]', {consultationID, videoRoomSID});
    setDidNavigateToVideoCall(true);

    const accessToken = await RNHelloDoctor.getVideoCallAccessToken(videoRoomSID);

    rootNavigation.navigate('VideoCallStack', {
        consultationID,
        videoRoomSID,
        accessToken,
    });
}
