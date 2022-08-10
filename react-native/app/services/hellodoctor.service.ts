import {RNHelloDoctor} from '@hellodoctor/react-native-sdk';
import {SchedulingAvailability, Consultation} from '@hellodoctor/react-native-sdk/dist/types';

export namespace HelloDoctorService {
    export function getAvailability(requestMode: string, specialty: string, startTime: Date, endTime: Date): Promise<Array<SchedulingAvailability>> {
        return RNHelloDoctor.getAvailability('callCenter', specialty, startTime, endTime);
    }

    export function requestConsultation(requestMode: string, specialty: string, requestedTime: Date, reason: string): Promise<void> {
        return RNHelloDoctor.requestConsultation(requestMode, specialty, requestedTime, reason);
    }

    export function getConsultations(limit: number): Promise<Array<Consultation>> {
        return RNHelloDoctor.getConsultations(limit);
    }
}
