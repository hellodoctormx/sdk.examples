import type {ReactElement} from 'react';
import React, {createContext, useContext, useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {navigationRef} from './app/utils/navigation';
import {teardownNotifications} from './app/notifications';
import {CurrentUser} from './app/types';
import {signIn} from './app/services/user.service';
import HomeScreen from './app/screens/home.screen';
import VideoCallScreen from './app/screens/video.screen';

const AppStack = createNativeStackNavigator();

type CurrentUserContextData = {
    currentUser: CurrentUser
    setCurrentUser: (currentUser: CurrentUser) => void
}

const CurrentUserContext = createContext<CurrentUserContextData>({currentUser: undefined, setCurrentUser: undefined});

export function useCurrentUserContext(): CurrentUserContextData {
    return useContext(CurrentUserContext);
}

export default function App(): ReactElement {
    const [currentUser, setCurrentUser] = useState<CurrentUser>();

    useEffect(() => {
        const authStateSubscriber = auth().onAuthStateChanged(registerAuthStateListener);

        return () => {
            authStateSubscriber();
            teardownApp().catch((error) => console.error('[App:useEffect:teardownApp]', error));
        };
    }, []);

    function registerAuthStateListener(user: FirebaseAuthTypes.User | undefined) {
        if (user !== null) {
            signIn().then(setCurrentUser);
        }
    }

    return (
        <NavigationContainer ref={navigationRef} >
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
                <AppStack.Navigator initialRouteName={'Home'} screenOptions={{headerShown: false}}>
                    <AppStack.Screen name={'Home'} component={HomeScreen} />
                    <AppStack.Screen name={'VideoCall'} component={VideoCallScreen} />
                </AppStack.Navigator>
            </CurrentUserContext.Provider>
        </NavigationContainer>
    );
}

async function teardownApp() {
    teardownNotifications();
}
