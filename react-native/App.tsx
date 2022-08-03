import type {ReactElement} from 'react';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {navigationRef} from './app/utils/navigation';
import HomeScreen from './app/screens/home.screen';
import {bootstrapNotifications, teardownNotifications} from './app/notifications';
import {registerDevice} from './app/utils/device';
import {configureHelloDoctorSDK} from './app/utils/helloDoctorHelper';
import {CurrentUser} from './app/types';
import {getCurrentUser, signIn} from './app/services/user.service';
import {View} from 'react-native';

const AppStack = createNativeStackNavigator();

type CurrentUserContextData = {
    currentUser: CurrentUser
    setCurrentUser: (currentUser: CurrentUser) => void
}

const CurrentUserContext = createContext<CurrentUserContextData>({currentUser: undefined, setCurrentUser: undefined});

export function useCurrentUserContext() {
    return useContext(CurrentUserContext);
}

export default function App(): ReactElement {
    const [currentUser, setCurrentUser] = useState<CurrentUser>();

    useEffect(() => {
        bootstrapApp(setCurrentUser).catch((error) => console.error('[App:useEffect:bootstrapApp]', error));

        return () => {
            teardownApp().catch((error) => console.error('[App:useEffect:teardownApp]', error));
        };
    }, []);

    return (
        <NavigationContainer ref={navigationRef}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
                <AppStack.Navigator initialRouteName={'Home'} screenOptions={{headerShown: false}}>
                    <AppStack.Screen name={'Home'} component={HomeScreen} />
                </AppStack.Navigator>
            </CurrentUserContext.Provider>
        </NavigationContainer>
    );
}

async function bootstrapApp(setCurrentUser: (currentUser: CurrentUser) => void) {
    const status = await messaging().hasPermission();

    if (status !== messaging.AuthorizationStatus.AUTHORIZED) {
        await messaging().requestPermission();
    }

    auth().onAuthStateChanged(async (currentAuthUser) => {
        console.debug('[auth().onAuthStateChanged]', currentAuthUser);

        if (currentAuthUser === null) {
            setCurrentUser(undefined);
            return;
        }

        await signIn();

        await registerDevice();

        await configureHelloDoctorSDK();

        bootstrapNotifications();
        console.debug("BOOTSTRAP setting current user from", getCurrentUser())
        setCurrentUser(getCurrentUser());
    });
}

async function teardownApp() {
    teardownNotifications();
}
