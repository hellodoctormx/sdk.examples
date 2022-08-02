package com.hellodoctormx.examples.foodpass

import android.util.Log
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.hellodoctormx.sdk.video.IncomingVideoCallNotification
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.CoroutineContext

class FoodPassFirebaseMessagingService: FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        Log.d(tag, "Refreshed token: $token")
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(tag, "Message data payload: ${remoteMessage.data}")
            when (remoteMessage.data["type"]) {
                "incomingVideoCall" -> run {
                    handleIncomingVideoCall(remoteMessage)
                }
                "videoCallEnded" -> run {
                    handleVideoCallEnded()
                }
            }
        }
    }

    private fun handleIncomingVideoCall(remoteMessage: RemoteMessage) {
        FirebaseAuth.getInstance().currentUser ?: run {
            Log.w(tag, "not handling incoming video call: no current user")
            return
        }

        val context = this

        CoroutineScope(Dispatchers.IO).launch {
            HelloDoctorHelper.configure(context)

            IncomingVideoCallNotification.display(
                context = context,
                videoRoomSID = remoteMessage.data["videoRoomSID"]!!,
                callerDisplayName = remoteMessage.data["callerDisplayName"]!!,
                callerPhotoURL = remoteMessage.data["callerPhotoURL"]
            )
        }
    }

    private fun handleVideoCallEnded() {
        IncomingVideoCallNotification.cancel(this)
    }

    companion object {
        private const val tag = "FoodPassFirebaseMessagingService"

        fun registerFirebaseMessagingToken() {
            val currentUser = FirebaseAuth.getInstance().currentUser ?: run {
                Log.w(tag, "not registering messaging token: no current user")
                return
            }

            FirebaseMessaging.getInstance().token.addOnCompleteListener {
                if (!it.isSuccessful) {
                    Log.w("FPFirebaseMessagingService", "Fetching FCM registration token failed", it.exception)
                    return@addOnCompleteListener
                }

                val documentUpdate = mapOf("fcmToken" to it.result)

                Firebase.firestore
                    .document("users/${currentUser.uid}")
                    .set(documentUpdate, SetOptions.merge())
            }
        }
    }
}
