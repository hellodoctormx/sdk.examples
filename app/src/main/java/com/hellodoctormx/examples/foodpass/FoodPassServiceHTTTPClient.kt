package com.hellodoctormx.examples.foodpass

import android.content.Context
import android.util.Log
import com.android.volley.DefaultRetryPolicy
import com.android.volley.DefaultRetryPolicy.DEFAULT_BACKOFF_MULT
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.json.JSONObject

abstract class FoodPassServiceHTTTPClient(val context: Context) {
    val tag = "FoodPassServiceHTTTPClient"
    val serviceHost: String = dotenv.get("SERVICE_HOST")

    suspend inline fun <reified T> get(path: String): T {
        return doRequest(Request.Method.GET, path, null)
    }

    suspend inline fun <reified T> post(path: String, postData: MutableMap<Any, Any>?): T {
        return doRequest(Request.Method.POST, path, postData)
    }

    suspend inline fun <reified T> put(path: String, postData: MutableMap<Any, Any>?): T {
        return doRequest(Request.Method.PUT, path, postData)
    }

    suspend inline fun <reified T> delete(path: String): T {
        return doRequest(Request.Method.DELETE, path, null)
    }

    suspend inline fun <reified T> doRequest(
        method: Int,
        path: String,
        data: MutableMap<Any, Any>?
    ): T = withContext(Dispatchers.IO) {
        val url = "${serviceHost}$path"
        Log.d(tag, "[doRequest:$method:$url]")
        val responseChannel = Channel<String?>()

        val jsonPostData = if (data == null) JSONObject() else JSONObject(data as Map<Any, Any>)

        val jsonObjectRequest = object : JsonObjectRequest(
            method,
            url,
            jsonPostData,
            Response.Listener {
                launch {
                    responseChannel.send(it.toString())
                    responseChannel.close()
                }
            },
            Response.ErrorListener { error ->
                responseChannel.close(error)
            }
        ) {
            override fun getHeaders(): MutableMap<String, String> {
                return getAuthorizationHeaders()
            }
        }

        with(jsonObjectRequest) {
            retryPolicy = DefaultRetryPolicy(5000, 0, DEFAULT_BACKOFF_MULT)

            Volley.newRequestQueue(context).add(this)
        }

        val rawResponse = responseChannel.receive()

        return@withContext Json.decodeFromString(rawResponse!!)
    }

    fun getAuthorizationHeaders(): MutableMap<String, String> {
        val headers = HashMap<String, String>()
        headers["Content-Type"] = "application/json"
        headers["X-Api-Key"] = dotenv.get("API_KEY")

        getCurrentUserJWT()?.let {
            headers["Authorization"] = "Bearer $it"
        }

        return headers
    }

    private fun getCurrentUserJWT(): String? = runBlocking {
        val currentUser = FirebaseAuth.getInstance().currentUser ?: return@runBlocking null

        val getTokenChannel = Channel<String?>()

        currentUser.getIdToken(false).addOnCompleteListener {
            runBlocking {
                getTokenChannel.send(it.result.token)
                getTokenChannel.close()
            }
        }

        return@runBlocking getTokenChannel.receive()
    }
}
