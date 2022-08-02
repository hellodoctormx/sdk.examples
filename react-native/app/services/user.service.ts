import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export async function createAnonymousUser() {
    await auth().signInAnonymously();

    await firestore().doc(`users/${auth().currentUser.uid}`).set({createdTime: new Date()});
}
