import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {CurrentUser} from '../types';
import ExampleAppHTTPClient from './http.service';
import {registerDevice} from '../utils/device';
import {configureHelloDoctorSDK} from '../utils/helloDoctorHelper';
import {bootstrapNotifications} from '../notifications';
import messaging from '@react-native-firebase/messaging';

let currentUser: CurrentUser;

export function getCurrentUser() {
    return currentUser;
}

export async function signIn(): Promise<CurrentUser> {
    if (currentUser !== undefined) {
        return;
    }

    if (auth().currentUser === null) {
        const demoEmailAddress = `demo+${new Date().getTime()}@hellodoctor.mx`;

        await auth().signInAnonymously();
        await auth().currentUser.updateEmail(demoEmailAddress);

        await firestore().doc(`users/${auth().currentUser.uid}`).set({username: demoEmailAddress, createdTime: new Date()});
    }

    return new Promise(resolve => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            if (user !== null) {
                bootstrapUser().then(resolve).finally(unsubscribe);
            }
        });
    });
}

async function bootstrapUser(): Promise<CurrentUser> {
    const status = await messaging().hasPermission();

    if (status !== messaging.AuthorizationStatus.AUTHORIZED) {
        await messaging().requestPermission();
    }

    console.debug('[bootstrapUser]', auth().currentUser);
    let helloDoctorUser;

    try {
        helloDoctorUser = await getHelloDoctorUser();
    } catch (error) {
        console.info('[getHelloDoctorUser:ERROR]', error);
        helloDoctorUser = await createHelloDoctorUser();
    }

    currentUser = {
        ...auth().currentUser,
        helloDoctorUserID: helloDoctorUser.uid,
        refreshToken: helloDoctorUser.refreshToken,
    };

    await registerDevice();

    await configureHelloDoctorSDK();

    bootstrapNotifications();

    return currentUser;
}

export async function signOut(): Promise<void> {
    currentUser = undefined;
    await auth().signOut();
}

type HelloDoctorUserResponse = {
    uid: string
    refreshToken: string
}

async function getHelloDoctorUser(): Promise<HelloDoctorUserResponse> {
    const apiClient = new ExampleAppHTTPClient();

    return apiClient.get('/users/me/hellodoctor');
}


async function createHelloDoctorUser(): Promise<HelloDoctorUserResponse> {
    const apiClient = new ExampleAppHTTPClient();

    return apiClient.post('/users/me/hellodoctor');
}
