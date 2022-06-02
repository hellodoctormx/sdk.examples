package com.hellodoctormx.examples.foodpass

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.volley.VolleyError
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import com.hellodoctormx.examples.foodpass.FoodPassFirebaseMessagingService.Companion.registerFirebaseMessagingToken
import com.hellodoctormx.examples.foodpass.ui.theme.FoodPassTheme
import com.hellodoctormx.sdk.HelloDoctorClient
import com.hellodoctormx.sdk.video.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

const val THIRD_PARTY_DEMO_API_KEY = "NOT_A_KEY"
const val HELLO_DOCTOR_DEMO_API_HOST = "https://public-api-3o7jotw3dq-uc.a.run.app"

class MainActivity : ComponentActivity() {
    private val tag = "app"

    private lateinit var foodPassAPI: FoodPassServiceAPI
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        foodPassAPI = FoodPassServiceAPI(this)

        auth = Firebase.auth

        HelloDoctorClient.configure(THIRD_PARTY_DEMO_API_KEY, HELLO_DOCTOR_DEMO_API_HOST)

        val vm = HomeScreenViewModel()

        setContent {
            HomeScreen(vm)
        }
    }

    public override fun onStart() {
        super.onStart()

        if (auth.currentUser != null) {
            handleAuthenticatedUser(this, auth.currentUser!!)
        } else {
            auth.signInWithEmailAndPassword("demo.patient@hellodoctor.mx", "AnyColourYouLike")
                .addOnCompleteListener(this) {
                    if (it.isSuccessful) {
                        handleAuthenticatedUser(this, it.result.user!!)
                    }
                }
        }
    }

    private fun handleAuthenticatedUser(context: Context, currentUser: FirebaseUser) {
        FoodPassServiceHTTTPClient.currentUserJWT = currentUser.getIdToken(false).result.token

        registerFirebaseMessagingToken()

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val helloDoctorUser = foodPassAPI.getHelloDoctorUser()
                Log.d(tag, "got hello doctor user ${helloDoctorUser.uid}")
                HelloDoctorClient.signIn(context, helloDoctorUser.uid, helloDoctorUser.authToken)

            } catch(error: VolleyError) {
                if (error.networkResponse.statusCode == 404) {
                    handleCreateHelloDoctorUser()
                } else {
                    Log.w(tag, "error getting HelloDoctor user: $error")
                }
            }
        }
    }

    private suspend fun handleCreateHelloDoctorUser() {
        try {
            val helloDoctorUser = foodPassAPI.createHelloDoctorUser()
            HelloDoctorClient.signIn(this, helloDoctorUser.uid, helloDoctorUser.authToken)
        } catch(error: VolleyError) {
            Log.w(tag, "error creating HelloDoctor user: $error")
        }
    }
}

fun launchCall(currentActivity: Context) {
    val launchCallIntent = Intent(currentActivity, IncomingVideoCallActivity::class.java).apply {
        putExtra(VIDEO_ROOM_SID, "RM3b74771ad32b0cfcb76087fa9e4fa61e")
        putExtra(CALLER_DISPLAY_NAME, "Dr. Daniel Tester")
        putExtra(CALLER_PHOTO_URL, "https://storage.googleapis.com/hellodoctor-staging-uploads/cc3823ec-c046-4e24-bcd5-da65a7012759-")
        putExtra(INCOMING_VIDEO_CALL_ACTION, "answered")
    }

    currentActivity.startActivity(launchCallIntent)
}

class HomeScreenViewModel : ViewModel() {
    fun doSignIn(context: Context, currentUser: FirebaseUser) {
        viewModelScope.launch {
            HelloDoctorClient.signIn(context, currentUser.uid, "")
//            launchCall(context)
        }
    }
}

@Composable
fun HomeScreen(viewModel: HomeScreenViewModel) {
    val context = LocalContext.current

    LaunchedEffect(Firebase.auth) {
        Firebase.auth.currentUser?.let {
            viewModel.doSignIn(context, it)
        }
    }

    FoodPassTheme {
        Text("app")
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    HomeScreen(HomeScreenViewModel())
}