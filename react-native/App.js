import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationRef} from './app/utils/navigation';
import HomeScreen from './app/screens/HomeScreen';
import SchedulingScreen from './app/screens/SchedulingScreen';
import {bootstrapNotifications, teardownNotifications} from './app/notifications';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import {createAnonymousUser} from './app/services/user.service';
import {registerDevice} from './app/utils/device';

const AppStack = createNativeStackNavigator();

export default function App() {
    useEffect(() => {
        bootstrapApp().catch((error) => console.error('[App:useEffect:bootstrapApp]', error));

        return () => {
            teardownApp().catch((error) => console.error('[App:useEffect:teardownApp]', error));
        };
    }, []);

    return (
        <NavigationContainer ref={navigationRef}>
            <AppStack.Navigator initialRouteName={'Home'}>
                <AppStack.Screen name={'Home'} component={HomeScreen} />
                <AppStack.Screen name={'Scheduling'} component={SchedulingScreen} />
            </AppStack.Navigator>
        </NavigationContainer>
    );
}

async function bootstrapApp() {
    const status = await messaging().hasPermission();

    if (status !== messaging.AuthorizationStatus.AUTHORIZED) {
        await messaging().requestPermission();
    }

    if (auth().currentUser === undefined) {
        await createAnonymousUser();
    }

    await registerDevice();

    bootstrapNotifications();
}

async function teardownApp() {
    teardownNotifications();
}
