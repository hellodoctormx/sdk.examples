package com.hellodoctormx.examples.foodpass

import android.content.Context
import android.util.Log
import com.hellodoctormx.sdk.HelloDoctorClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class HelloDoctorHelper {
    companion object {
        private const val tag = "HelloDoctorHelper"

        suspend fun configure(context: Context) = withContext(Dispatchers.IO) {
            HelloDoctorClient.configure(dotenv.get("API_KEY"), dotenv.get("HELLO_DOCTOR_API_HOST"))
            HelloDoctorClient.createVideoCallNotificationChannel(context)

            val helloDoctorUser = getHelloDoctorUser(context)
                ?: createHelloDoctorUser(context)
                ?: throw Error("hellodoctor_user_unavailable")

            HelloDoctorClient.signIn(context, helloDoctorUser.uid, helloDoctorUser.refreshToken)
        }

        private suspend fun getHelloDoctorUser(context: Context): HelloDoctorUserResponse? {
            return try {
                FoodPassServiceAPI(context).getHelloDoctorUser()
            } catch(error: Exception) {
                Log.w(tag, "error: $error")
                null
            }
        }

        private suspend fun createHelloDoctorUser(context: Context): HelloDoctorUserResponse? {
            return try {
                FoodPassServiceAPI(context).createHelloDoctorUser()
            } catch(error: Exception) {
                Log.w(tag, "error: $error")
                null
            }
        }
    }
}