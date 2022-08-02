import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

import CollectionReference = FirebaseFirestoreTypes.CollectionReference;

import {UserDevice} from '../types';

export async function registerDevice() {
    try {
        await getDeviceSnapshot();
    } catch (error) {
        if (error === 'device_not_found_error') {
            return doRegisterDevice();
        } else {
            throw error;
        }
    }
}

async function doRegisterDevice() {
    const deviceToken = await messaging().getToken();

    if (deviceToken === undefined) {
        throw 'device_token_undefined_error';
    }

    const newUserDeviceRef = getCurrentUserDevicesRef().doc();

    const newUserDevice: UserDevice = {
        id: newUserDeviceRef.id,
        fcmToken: deviceToken,
        createdTime: new Date(),
        lastSeenTime: new Date(),
        apnsToken: '',
    };

    await newUserDeviceRef.set(newUserDevice);
}

export async function getDeviceSnapshot() {
    const {currentUser} = auth();

    if (currentUser === undefined) {
        throw 'unauthenticated_error';
    }

    const deviceToken = await messaging().getToken();

    if (deviceToken === undefined) {
        throw 'device_token_undefined_error';
    }

    const currentUserDevicesRef = getCurrentUserDevicesRef();

    const deviceQuerySnapshot = await currentUserDevicesRef
        .where('fcmToken', '==', deviceToken)
        .get();

    if (deviceQuerySnapshot.empty) {
        throw 'device_not_found_error';
    }

    return deviceQuerySnapshot.docs[0];
}

function getCurrentUserDevicesRef(): CollectionReference<UserDevice> {
    return firestore().collection(`users/${auth().currentUser.uid}/devices`);
}
