import type {ReactElement} from 'react';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationRef} from './app/utils/navigation';
import HomeScreen from './app/screens/home.screen';
import VideoCallScreen from './app/screens/video.screen';
import {teardownNotifications} from './app/notifications';
import {CurrentUser} from './app/types';

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
        return () => {
            teardownApp().catch((error) => console.error('[App:useEffect:teardownApp]', error));
        };
    }, []);

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
