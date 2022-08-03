import _ from 'lodash';
import moment from 'moment';
import * as React from 'react';
import {createContext, ReactElement, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

import {
    Consultation,
    ConsultationType,
    PractitionerSpecialty,
    SchedulingAvailability,
} from '@hellodoctor/react-native-sdk/lib/types';

import {alpha, HelloDoctorColors, HelloDoctorFonts, ThemeColors} from '../utils/theme';
import {SchedulingContextProvider, useSchedulingContext} from '../contexts/scheduling.context';
import Button from '../components/Button';
import {HelloDoctorService} from '../services/hellodoctor.service';
import CollapsibleView from '../components/CollapsibleView';
import HideableView from '../components/HideableView';
import Modal from '../components/Modal';
import {SpecialtyIcon} from '../components/icons/specialties.icons';
import {signIn, signOut} from '../services/user.service';
import {useCurrentUserContext} from '../../App';
import getConsultations = HelloDoctorService.getConsultations;
import {ConsultationCard} from '../components/Consultation';

const CHAT_CONSULTATIONS_ENABLED = false;

type IHomeScreenContext = {
    consultations: Array<Consultation>
    setConsultations: (consultations: Array<Consultation>) => void
}

const HomeScreenContext = createContext<Partial<IHomeScreenContext>>({
    consultations: undefined,
    setConsultations: undefined,
});

function useHomeScreenContext() {
    return useContext(HomeScreenContext);
}

export default function HomeScreenProvider(): ReactElement {
    const [consultations, setConsultations] = useState<Array<Consultation>>([]);

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

    useEffect(() => {
        if (currentUser !== undefined) {
            getConsultations(3).then(setConsultations);
        }
    }, [currentUser]);

    useEffect(() => {
        setIsSchedulingConsultation(consultations.length === 0);
    }, [consultations]);

    function doSignIn() {
        setIsSigningIn(true);

        signIn().finally(() => setIsSigningIn(false));
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
                    <SchedulingSection setIsSchedulingConsultation={setIsSchedulingConsultation}/>
                </SchedulingContextProvider>
            </CollapsibleView>
            {!isSchedulingConsultation && (
                <Button
                    label={'Schedule new consultation'}
                    onPress={() => setIsSchedulingConsultation(true)}
                    color={HelloDoctorColors.Green500}
                />
            )}
            <View style={{flex: 1, justifyContent: "flex-end", marginBottom: 128}}>
                {currentUser === undefined && <Button label={'Sign in'} onPress={doSignIn} color={HelloDoctorColors.Blue500} loading={isSigningIn} style={{marginTop: 36}}/>}
                {currentUser !== undefined && <Button label={'Sign out'} onPress={doSignOut} color={HelloDoctorColors.Red500} disabled={isSigningIn} style={{marginTop: 36}}/>}
            </View>
        </View>
    );
}

type SchedulingSectionProps = {
    setIsSchedulingConsultation: (isSchedulingConsultation: boolean) => void
}

function SchedulingSection(props: SchedulingSectionProps): ReactElement {
    const {consultationSpecialty, consultationType, setConsultationType, scheduledStart, consultationReason, isRequestReady} = useSchedulingContext();
    const {setConsultations} = useHomeScreenContext();

    const [isRequestingConsultation, setIsRequestingConsultation] = useState(false);
    const [didRequestConsultation, setDidRequestConsultation] = useState(false);

    useEffect(() => {
        if (!CHAT_CONSULTATIONS_ENABLED && consultationType === undefined) {
            setConsultationType(ConsultationType.VIDEO);
        }
    }, [CHAT_CONSULTATIONS_ENABLED, consultationType]);

    function requestConsultation() {
        if (!isRequestReady) {
            return;
        }

        setIsRequestingConsultation(true);

        HelloDoctorService
            .requestConsultation('callCenter', consultationSpecialty, scheduledStart, consultationReason)
            .then(() => {
                setDidRequestConsultation(true);

                setTimeout(() => setDidRequestConsultation(false), 3000);

                Alert.alert('Success!', 'Your consultation was scheduled successfully');

                return getConsultations(3);
            })
            .then(setConsultations)
            .catch((error) => console.error('[SchedulingSection:doRequestConsultation]', error))
            .finally(() => setIsRequestingConsultation(false));
    }

    function cancelScheduling() {
        props.setIsSchedulingConsultation(false);
    }

    return (
        <View>
            <SpecialtySelection/>
            {CHAT_CONSULTATIONS_ENABLED && <ConsultationTypeSelection/>}
            <ScheduledStartSelection/>
            {/*<ConsultationReasonInput/>*/}
            <Button label={'Agendar'} color={ThemeColors.GoodAction} onPress={requestConsultation} disabled={!isRequestReady} loading={isRequestingConsultation}/>
            <TouchableOpacity onPress={cancelScheduling} style={{alignSelf: 'center'}} disabled={isRequestingConsultation}>
                <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 17, color: HelloDoctorColors.Red500, textAlign: 'center', marginTop: 12}}>
                    Cancelar
                </Text>
            </TouchableOpacity>
            <CollapsibleView isCollapsed={!didRequestConsultation} style={{alignItems: 'center'}}>
                {/*<Icon name={'check'} size={22} color={HelloDoctorColors.Green500}/>*/}
                <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 22, color: HelloDoctorColors.Green500, textAlign: 'center', marginTop: 12}}>
                    Asesoria programada!
                </Text>
            </CollapsibleView>
        </View>
    );
}

const CONSULTATION_SPECIALTY_OPTIONS = [
    {id: 'Médico General', display: 'Médico General'},
    {id: 'Fisioterapia', display: 'Fisioterapeuta'},
    {id: 'Psicología', display: 'Psicólogo'},
    {id: 'Nutrición', display: 'Nutriólogo'},
    {id: 'Medicina Veterinaria', display: 'Veterinario'},
];

function SpecialtySelection(): ReactElement {
    return (
        <View>
            {CONSULTATION_SPECIALTY_OPTIONS.map((option) => (
                <CallCenterSpecialtyOption key={option.id} option={option} disabled={false}/>
            ))}
        </View>
    );
}

type CallCenterSpecialtyOptionProps = {
    option: PractitionerSpecialty
    disabled: boolean
}

function CallCenterSpecialtyOption(props: CallCenterSpecialtyOptionProps): JSX.Element {
    const {consultationSpecialty, setConsultationSpecialty} = useSchedulingContext();

    const isSelectedOption = consultationSpecialty === props.option.id;

    const doToggleOption = async () => {
        setConsultationSpecialty(isSelectedOption ? undefined : props.option.id);
    };

    return (
        <HideableView isHidden={consultationSpecialty !== undefined && !isSelectedOption} style={{marginBottom: 6}}>
            <TouchableOpacity
                onPress={doToggleOption}
                disabled={props.disabled}
                style={{
                    padding: 12,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    borderWidth: isSelectedOption ? 1 : 0,
                    borderColor: HelloDoctorColors.Green500,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <HideableView isHidden={isSelectedOption} horizontal={true} style={{width: 48, alignItems: 'center', marginRight: 12}}>
                        <SpecialtyIcon size={42} specialty={props.option}/>
                    </HideableView>
                    <Text style={{flex: 1, fontFamily: HelloDoctorFonts.TextSemiBold, fontSize: 22, color: HelloDoctorColors.Blue700}}>
                        {props.option.display}
                    </Text>
                    <HideableView isHidden={!props.disabled}>
                        <Text style={{fontFamily: HelloDoctorFonts.TextRegular, fontSize: 15, color: HelloDoctorColors.Red500}}>
                            Disponible pronto
                        </Text>
                    </HideableView>
                </View>
                <CollapsibleView isCollapsed={!isSelectedOption} style={{alignItems: 'flex-end'}}>
                    <TouchableOpacity onPress={doToggleOption} style={{borderWidth: 1, borderColor: alpha(HelloDoctorColors.Red500, 0.3), borderRadius: 6, paddingLeft: 12, paddingRight: 12, padding: 3, marginTop: 6, backgroundColor: 'white'}}>
                        <Text style={{fontFamily: HelloDoctorFonts.TextSemiBold, fontSize: 13, color: HelloDoctorColors.Red300}}>
                            Cambiar
                        </Text>
                    </TouchableOpacity>
                </CollapsibleView>
            </TouchableOpacity>
        </HideableView>
    );
}

function ConsultationTypeSelection(): ReactElement {
    const {consultationType, setConsultationType} = useSchedulingContext();

    return (
        <View>
            {Object.values(ConsultationType).map((option) => {
                const isSelectedOption = consultationType === option;

                function toggleOption() {
                    setConsultationType(isSelectedOption ? undefined : option);
                }

                return consultationType !== undefined && !isSelectedOption ? null : (
                    <TouchableOpacity key={option} onPress={toggleOption} style={{margin: 6, padding: 9, borderColor: ThemeColors.GoodAction, borderWidth: isSelectedOption ? 1 : 0, borderRadius: 6}}>
                        <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 16, color: ThemeColors.TextMain}}>{option}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

type MonthRange = {
    start: Date
    end: Date
}

function getMonthRange(forDate: Date): MonthRange {
    const monthStart = new Date(forDate);
    monthStart.setDate(1);

    const monthEnd = new Date(forDate);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(-1);

    return {
        start: monthStart,
        end: monthEnd,
    };
}

export function ScheduledStartSelection(): JSX.Element {
    const {consultationSpecialty, scheduledStart, setScheduledStart} = useSchedulingContext();

    const [selectedDate, setSelectedDate] = useState<Date>(scheduledStart);
    const [currentMonthRange, setCurrentMonthRange] = useState<MonthRange>(getMonthRange(new Date()));
    const [availableTimes, setAvailableTimes] = useState<Array<SchedulingAvailability>>([]);
    const [disabledDates, setDisabledDates] = useState([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    const [showCalendarPicker, setShowCalendarPicker] = useState(true);
    const [showScheduledStart, setShowScheduledStart] = useState(true);

    useEffect(() => {
        getCurrentMonthAvailableTimes().catch(error => console.error('[ScheduledStartSelection:useEffect:doGetCurrentMonthAvailableTimes]', error));
    }, [currentMonthRange.start, consultationSpecialty]);

    useEffect(() => {
        const currentMonthEndDate = currentMonthRange.end.getDate();

        const newDisabledDates = _.range(1, currentMonthEndDate + 1)
            .filter(date => !availableTimes.some((time) => time.start.getDate() === date))
            .map(disabledDate => {
                const disabled = new Date(currentMonthRange.start);
                disabled.setDate(disabledDate);

                return disabled;
            });

        setDisabledDates(newDisabledDates);
    }, [availableTimes]);

    useEffect(() => {
        if (scheduledStart) {
            setSelectedDate(undefined);
        }
    }, [scheduledStart]);

    async function getCurrentMonthAvailableTimes() {
        if (consultationSpecialty === undefined || currentMonthRange.start === undefined) {
            return;
        }

        setIsLoadingAvailability(true);

        try {
            const newAvailableTimes = await HelloDoctorService
                .getAvailability('callCenter', consultationSpecialty, currentMonthRange.start, currentMonthRange.end);

            setAvailableTimes(newAvailableTimes);
        } catch (error) {
            console.error('[ScheduledStartSelection:getCurrentMonthAvailableTimes]', error);
        } finally {
            setIsLoadingAvailability(false);
        }
    }

    const selectedDateAvailableTimes = selectedDate === undefined ? []
        : availableTimes.filter(time => time.start.getDate() === selectedDate.getDate());

    const isCollapsed = consultationSpecialty === undefined;

    useEffect(() => {
        setShowCalendarPicker(selectedDate === undefined && scheduledStart === undefined);
        setShowScheduledStart(scheduledStart !== undefined);
    }, [selectedDate, scheduledStart]);

    const formattedPreviousMonth = moment(currentMonthRange.start).subtract(1, 'months').format('MMMM');
    const formattedNextMonth = moment(currentMonthRange.start).add(1, 'months').format('MMMM');

    return (
        <CollapsibleView isCollapsed={isCollapsed}>
            <CollapsibleView isCollapsed={!showCalendarPicker}>
                <View style={{borderWidth: 1, borderColor: HelloDoctorColors.Blue100, borderRadius: 6, backgroundColor: 'white'}}>
                    <CalendarPicker
                        selectedStartDate={selectedDate}
                        onDateChange={(newSelectedDate) => setSelectedDate(moment(newSelectedDate).toDate())}
                        onMonthChange={monthStart => setCurrentMonthRange(getMonthRange(monthStart))}
                        todayBackgroundColor={'white'}
                        selectedDayColor={'white'}
                        months={['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']}
                        weekdays={_.range(7).map(day => moment().isoWeekday(day).format('ddd'))}
                        previousTitle={formattedPreviousMonth}
                        previousTitleStyle={{color: HelloDoctorColors.Blue300, fontSize: 16, fontFamily: HelloDoctorFonts.TextTitle}}
                        nextTitle={formattedNextMonth}
                        nextTitleStyle={{color: HelloDoctorColors.Blue300, fontSize: 16, fontFamily: HelloDoctorFonts.TextTitle}}
                        minDate={new Date()}
                        textStyle={{fontFamily: HelloDoctorFonts.TextSemiBold}}
                        restrictMonthNavigation={true}
                        disabledDates={disabledDates}
                        scrollable={false}
                    />
                </View>
            </CollapsibleView>
            <CollapsibleView isCollapsed={!showScheduledStart}>
                <TouchableOpacity onPress={() => setScheduledStart(undefined)} style={{padding: 6, borderWidth: 1, borderRadius: 6, borderColor: HelloDoctorColors.Green500, backgroundColor: '#FFFFFF'}}>
                    <Text style={{fontFamily: HelloDoctorFonts.TextRegular, fontSize: 13, color: ThemeColors.TextSecondary}}>Hora de la consulta</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{flex: 1, fontFamily: HelloDoctorFonts.TextSemiBold, fontSize: 18, color: HelloDoctorColors.Blue700}}>{moment(scheduledStart).format('DD MMMM [a las] HH:mm')}</Text>
                        <View>
                            {/*<Icon name={'check'} size={17} color={HelloDoctorColors.Green500}/>*/}
                        </View>
                    </View>
                </TouchableOpacity>
            </CollapsibleView>
            <HideableView isHidden={!isLoadingAvailability} style={{position: 'absolute', width: '100%', height: '100%'}}>
                <View style={{flex: 1, margin: 3, borderRadius: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(HelloDoctorColors.Blue500, 0.05)}}>
                    <ActivityIndicator animating={isLoadingAvailability} size={'large'} color={HelloDoctorColors.Blue500}/>
                </View>
            </HideableView>
            <Modal visible={selectedDate !== undefined}>
                <TouchableOpacity onPress={() => setSelectedDate(undefined)} style={{position: 'absolute', width: '100%', height: '100%'}}/>
                <View style={{backgroundColor: 'white', borderRadius: 12, margin: 12, marginTop: 48, padding: 18}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Pressable onPress={() => setSelectedDate(undefined)}>
                            <View style={{height: 32, width: 32, borderRadius: 32, backgroundColor: HelloDoctorColors.Blue500}}>
                                {/*<Icon name={'arrow-left'} size={20} color={'white'}/>*/}
                            </View>
                        </Pressable>
                        <View style={{marginLeft: 12}}>
                            <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 18, color: ThemeColors.TextMain}}>{moment(selectedDate).format('dddd')}</Text>
                            <Text style={{fontFamily: HelloDoctorFonts.TextRegular, fontSize: 15, color: ThemeColors.TextSecondary}}>{moment(selectedDate).format('DD MMM YYYY')}</Text>
                        </View>
                    </View>
                    <ScrollView style={{maxHeight: 396, marginTop: 24}}>
                        {selectedDateAvailableTimes.map((availability, index) => (
                            <SelectableAvailability key={index} availability={availability}/>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </CollapsibleView>
    );
}

type SelectableAvailabilityProps = {
    availability: SchedulingAvailability
}

export function SelectableAvailability(props: SelectableAvailabilityProps): JSX.Element {
    const {availability} = props;

    const {scheduledStart, setScheduledStart} = useSchedulingContext();

    const isSelected = availability.start.getTime() === scheduledStart?.getTime();
    const backgroundColor = isSelected ? HelloDoctorColors.Blue500 : 'white';
    const color = isSelected ? '#FFFFFF' : HelloDoctorColors.Blue700;

    return (
        <View style={{margin: 12, marginBottom: 6, marginTop: 0}}>
            <TouchableOpacity onPress={() => setScheduledStart(availability.start)} style={{
                margin: 6,
                padding: 6,
                borderRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor,
                borderWidth: 1,
                borderColor: alpha(HelloDoctorColors.Blue500, 0.1),
                elevation: 1,
                shadowOffset: {height: 1, width: 1},
                shadowColor: HelloDoctorColors.Blue500,
                shadowRadius: 2,
                shadowOpacity: 0.3,
            }}>
                <Text style={{fontFamily: HelloDoctorFonts.TextRegular, fontSize: 18, color, marginLeft: 4}}>{moment(availability.start).format('h:mm a')}</Text>
            </TouchableOpacity>
        </View>
    );
}

function ConsultationReasonInput(): ReactElement {
    const [consultationReason, setConsultationReason] = useState<string>('');
    console.debug('[ConsultationReasonInput]', {consultationReason});
    return (
        <TextInput
            placeholder={'Razón de la consulta'}
            value={'FUCK YOU'}
            onChangeText={(reason) => {
                console.debug('WHY THE FUCK', reason);
            }}
        />
    );
}
