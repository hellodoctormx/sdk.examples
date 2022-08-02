import notifee, {EventType} from '@notifee/react-native';
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

let initialNavigationScreen = null;
let initialNavigationParams = null;

export function bootstrapNotifications() {
    if (isSubscribed) {
        return;
    }

    isSubscribed = true;

    registerForegroundEventHandlers();

    messaging().onMessage(onMessageReceived);
}

export function teardownNotifications() {
    if (onForegroundEventSubscription !== null) {
        onForegroundEventSubscription();
        onForegroundEventSubscription = null;
    }

    isSubscribed = false;

    messaging()
        .unregisterDeviceForRemoteMessages()
        .catch(error => console.warn(`error unregistering FCM: ${error}`));
}


export async function onMessageReceived(message) {
    const {currentUser} = auth();

    if (!currentUser) {
        return;
    }

    console.info('[notifications:onMessageReceived]', message);

    const {data} = message;

    // Set the message's notification as the default to allow server-side notifications
    let notification = message.notification;

    try {
        switch (data?.type) {
        case 'incomingVideoCall':
            let {videoRoomSID, callerDisplayName, callerPhotoURL, consultationID} =
                    data;
            await handleIncomingVideoCallNotification(
                videoRoomSID,
                callerDisplayName,
                callerPhotoURL,
                consultationID,
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

    onForegroundEventSubscription = notifee.onForegroundEvent(event => {
        if (!isSubscribed) {
            return;
        }

        console.info('[notifications:onForegroundEvent]', event);

        const {type, detail} = event;

        switch (type) {
        case EventType.DISMISSED:
            switch (detail.notification.data?.type) {
            case 'incomingVideoCall':
                RNHelloDoctor.handleIncomingVideoCallNotificationRejected();
                break;
            }
            break;
        case EventType.ACTION_PRESS:
            const {pressAction, notification} = detail;

            const {data} = notification;

            switch (pressAction.id) {
            case 'reject':
                RNHelloDoctor.handleIncomingVideoCallNotificationRejected();
                break;
            case 'answer':
                navigateToVideoCall(data.consultationID, data.videoRoomSID)
                    .catch(error => console.error(`error navigating to video call: ${error}`));
                break;
            }
        }
    });
}

export function registerBackgroundEventHandlers() {
    console.info('registering background event handler');

    messaging().setBackgroundMessageHandler(async message => {
        onMessageReceived(message).catch(error => console.error(error));
    });

    notifee.onBackgroundEvent(async event => {
        if (!auth().currentUser) {
            return;
        }

        console.info('[notifications:onBackgroundEvent]', {event});

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
            const {pressAction} = detail;

            switch (pressAction.id) {
            case 'answer':
                console.debug('[onBackgroundEvent:ACTION_PRESS:answer]');
                // acceptIncomingVideoCall(data.consultationID, data.videoRoomSID).catch(error => logError(`error accepting incoming call: ${error}`));
                break;
            case 'reject':
                RNHelloDoctor.handleIncomingVideoCallNotificationRejected();
                break;
            }
        }

        // Remove the notification
        await notifee.cancelNotification(notification.id);
    });
}


export function setInitialNavigation(screen, params) {
    console.debug('[setInitialNavigation]', {screen});
    initialNavigationScreen = screen;
    initialNavigationParams = params;
}
