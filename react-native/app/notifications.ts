import notifee, {EventType, Event} from '@notifee/react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {RNHelloDoctor} from '@hellodoctor/react-native-sdk';

import {
    handleIncomingVideoCallNotification,
    handleVideoCallEndedNotification,
    navigateToVideoCall,
} from './utils/helloDoctorHelper';

let isSubscribed = false;
let onForegroundEventSubscription = null;

export function bootstrapNotifications(): void {
    if (isSubscribed) {
        return;
    }

    isSubscribed = true;

    registerForegroundEventHandlers();

    messaging().onMessage(onMessageReceived);
}

export function teardownNotifications(): void {
    if (onForegroundEventSubscription !== null) {
        onForegroundEventSubscription();
        onForegroundEventSubscription = null;
    }

    isSubscribed = false;

    messaging()
        .unregisterDeviceForRemoteMessages()
        .catch(error => console.warn(`error unregistering FCM: ${error}`));
}


export async function onMessageReceived(message): Promise<void> {
    const {currentUser} = auth();

    if (!currentUser) {
        return;
    }

    console.info('[notifications:onMessageReceived]', message);

    const {data} = message;

    // Set the message's notification as the default to allow server-side notifications
    const notification = message.notification;

    try {
        switch (data?.type) {
        case 'incomingVideoCall':
            await handleIncomingVideoCallNotification(
                data.videoRoomSID,
                data.callerDisplayName,
                data.callerPhotoURL,
                data.consultationID,
            );
            return;
        case 'videoCallEnded':
            await handleVideoCallEndedNotification(data.videoRoomSID);
            return;
        }

        if (!notification) {
            console.info(
                '[onMessageReceived] returning without displaying notification: no notification available',
            );
            return;
        }

        notifee
            .displayNotification(notification)
            .catch(error => console.error(`error displaying notification: ${error}`));
    } catch (error) {
        console.error(`[onMessageReceived] error: ${error}`);
    }
}

function registerForegroundEventHandlers() {
    if (onForegroundEventSubscription !== null) {
        // already subscribed, don't do it again
        return;
    }

    onForegroundEventSubscription = notifee.onForegroundEvent(handleNotificationEvent);
}

export function registerBackgroundEventHandlers(): void {
    console.info('registering background event handler');

    messaging().setBackgroundMessageHandler(async message => {
        onMessageReceived(message).catch(error => console.error(error));
    });

    notifee.onBackgroundEvent(handleNotificationEvent);
}

async function handleNotificationEvent(event: Event): Promise<void> {
    if (!auth().currentUser) {
        return;
    }

    console.info('[notifications:onForegroundEvent]', event);

    const {type, detail} = event;
    const {notification} = detail;

    switch (type) {
    case EventType.DISMISSED:
        switch (detail.notification.data?.type) {
        case 'incomingVideoCall':
            RNHelloDoctor.handleIncomingVideoCallNotificationRejected();
            break;
        }
        break;
    case EventType.ACTION_PRESS:
        switch (detail.pressAction.id) {
        case 'reject':
            RNHelloDoctor.handleIncomingVideoCallNotificationRejected();
            break;
        case 'answer':
            navigateToVideoCall(
                notification.data.consultationID,
                notification.data.videoRoomSID
            ).catch(error => console.error(`error navigating to video call: ${error}`));
            break;
        }
    }

    // Remove the notification
    notifee.cancelNotification(notification.id).catch((error) => {
        console.warn(`error cancelling notification ${notification.id}`, error);
    });
}
