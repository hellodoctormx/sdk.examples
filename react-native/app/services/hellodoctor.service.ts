import {Platform} from 'react-native';
import {RNHelloDoctor, RNHelloDoctorTypes} from '@hellodoctor/react-native-sdk';
import notifee from '@notifee/react-native';

// @ts-ignore
import {name as appName} from '../../app.json';
import * as rootNavigation from '../utils/navigation';
import {navigateToHome} from '../utils/navigation';
import {getDeviceSnapshot} from '../utils/device';
import {bootstrapUser, getCurrentUser} from './user.service';
import {API_KEY, HELLO_DOCTOR_API_HOST} from '../../app.config.js';

export async function configureHelloDoctorSDK(): Promise<void> {
    const currentUser = getCurrentUser();

    const config: RNHelloDoctorTypes.ConfigOptions = {
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
    await RNHelloDoctor.auth.signIn(currentUser.helloDoctorUserID, currentUser.refreshToken);
}

async function registerPushKitToken(token: string): Promise<void> {
    const deviceSnapshot = await getDeviceSnapshot();
    await deviceSnapshot.ref.update({apnsToken: token});
}

export async function handleIncomingVideoCallNotification(
    videoRoomSID: string,
    callerDisplayName: string,
    callerPhotoURL: string,
    consultationID: string,
): Promise<void> {
    if (Platform.OS === 'android') {
        await bootstrapUser();

        await RNHelloDoctor.video.handleIncomingVideoCallNotification({
            videoRoomSID,
            consultationID,
            callerDisplayName,
            callerPhotoURL,
        });
    }
}

export async function handleVideoCallEndedNotification(videoRoomSID: string): Promise<void> {
    try {
        await RNHelloDoctor.video.handleVideoCallEndedNotification(videoRoomSID);
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

export async function navigateToVideoCall(consultationID: string, videoRoomSID: string): Promise<void> {
    const accessToken = await RNHelloDoctor.video.getVideoCallAccessToken(videoRoomSID);

    rootNavigation.navigate('VideoCall', {
        consultationID,
        videoRoomSID,
        accessToken,
    });
}
