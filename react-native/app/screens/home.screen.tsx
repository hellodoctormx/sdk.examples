import * as React from 'react';
import {createContext, ReactElement, useContext, useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';

import {RNHelloDoctorTypes} from '@hellodoctor/react-native-sdk';
import {HelloDoctorColors, HelloDoctorFonts, ThemeColors} from '@hellodoctor/react-native-sdk/dist/ui/theme';
import Button from '@hellodoctor/react-native-sdk/dist/ui/components/Button';
import CollapsibleView from '@hellodoctor/react-native-sdk/dist/ui/components/CollapsibleView';
import {ConsultationCard} from '@hellodoctor/react-native-sdk/dist/ui/components/Consultation';
import {SchedulingContextProvider} from '@hellodoctor/react-native-sdk/dist/ui/scheduling/scheduling.context';
import {SchedulingSection} from '@hellodoctor/react-native-sdk/dist/ui/scheduling/scheduling.components';

import {signIn, signOut} from '../services/user.service';
import {useCurrentUserContext} from '../../App';
import {RNHelloDoctor} from '@hellodoctor/react-native-sdk';

type IHomeScreenContext = {
    consultations: Array<RNHelloDoctorTypes.Consultation>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setConsultations: (consultations: Array<RNHelloDoctorTypes.Consultation>) => void
}

const HomeScreenContext = createContext<Partial<IHomeScreenContext>>({
    consultations: undefined,
    setConsultations: undefined,
});

function useHomeScreenContext() {
    return useContext(HomeScreenContext);
}

export default function HomeScreenProvider(): ReactElement {
    const [consultations, setConsultations] = useState<Array<RNHelloDoctorTypes.Consultation>>([]);

    return (
        <HomeScreenContext.Provider value={{consultations, setConsultations}}>
            <HomeScreen/>
        </HomeScreenContext.Provider>
    );
}

function HomeScreen(): ReactElement {
    const {currentUser, setCurrentUser} = useCurrentUserContext();
    const {consultations, setConsultations} = useHomeScreenContext();

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSchedulingConsultation, setIsSchedulingConsultation] = useState(true);
    const [didRequestConsultation, setDidRequestConsultation] = useState(false);

    useEffect(() => {
        if (currentUser !== undefined) {
            RNHelloDoctor.consultations.getConsultations(3).then(setConsultations);
        }
    }, [currentUser]);

    useEffect(() => {
        setIsSchedulingConsultation(consultations.length === 0);
    }, [consultations]);

    function doSignIn() {
        setIsSigningIn(true);

        signIn()
            .then(setCurrentUser)
            .finally(() => setIsSigningIn(false));
    }

    function doSignOut() {
        signOut().then(() => {
            setCurrentUser(undefined);
            setConsultations([]);
        });
    }

    return (
        <View style={{flex: 1, backgroundColor: ThemeColors.ScreenBackground, padding: 18}}>
            <Text style={{fontFamily: HelloDoctorFonts.TextRegular, fontSize: 20, color: ThemeColors.TextMain, marginBottom: 18}}>
                HelloDoctor React Native Example App
            </Text>
            <CollapsibleView isCollapsed={isSchedulingConsultation}>
                <ScrollView>
                    {consultations.map((consultation) => <ConsultationCard key={consultation.id} consultation={consultation}/>)}
                </ScrollView>
            </CollapsibleView>
            <CollapsibleView isCollapsed={!isSchedulingConsultation || currentUser === undefined}>
                <SchedulingContextProvider>
                    <SchedulingSection
                        onCancel={() => setIsSchedulingConsultation(false)}
                        chatEnabled={false}
                        onRequestConsultationSuccess={async () => {
                            setDidRequestConsultation(true);

                            setTimeout(() => setDidRequestConsultation(false), 3000);

                            Alert.alert(
                                'Success!',
                                'Your consultation was scheduled successfully',
                            );

                            const freshConsultations = await RNHelloDoctor.consultations.getConsultations(3);
                            setConsultations(freshConsultations);
                        }}
                        onRequestConsultationError={(error) => {
                            console.error('[onRequestConsultationError]', error);
                        }}
                    />
                    <CollapsibleView isCollapsed={!didRequestConsultation} style={{alignItems: 'center'}}>
                        <Text
                            style={{
                                fontFamily: HelloDoctorFonts.TextBold,
                                fontSize: 22,
                                color: HelloDoctorColors.Green500,
                                textAlign: 'center',
                                marginTop: 12,
                            }}>
                            Asesoria programada!
                        </Text>
                    </CollapsibleView>
                </SchedulingContextProvider>
            </CollapsibleView>
            {!isSchedulingConsultation && (
                <Button
                    label={'Schedule new consultation'}
                    onPress={() => setIsSchedulingConsultation(true)}
                    color={HelloDoctorColors.Green500}
                />
            )}
            <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 128}}>
                {currentUser === undefined && <Button label={'Create account'} onPress={doSignIn} color={HelloDoctorColors.Blue500} loading={isSigningIn} style={{marginTop: 36}}/>}
                {currentUser !== undefined && <Button label={'Sign out'} onPress={doSignOut} color={HelloDoctorColors.Red500} style={{marginTop: 36}}/>}
            </View>
        </View>
    );
}
