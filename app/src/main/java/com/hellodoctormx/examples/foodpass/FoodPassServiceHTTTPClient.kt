package com.hellodoctormx.examples.foodpass

import android.content.Context
import android.util.Log
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.json.JSONObject


const val DEMO_SERVICE_HOST = "https://third-party-demo-service-3o7jotw3dq-uc.a.run.app"

abstract class FoodPassServiceHTTTPClient(val context: Context) {
    val tag = "FoodPassServiceHTTTPClient"

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
        val responseChannel = Channel<String>()

        val url = "${DEMO_SERVICE_HOST}$path"

        val asyncRequest = async(Dispatchers.IO) {
            val jsonPostData = if (data == null) JSONObject() else JSONObject(data as Map<Any, Any>)

            val jsonObjectRequest = object : JsonObjectRequest(
                method,
                url,
                jsonPostData,
                { jsonObjectResponse ->
                    launch(Dispatchers.IO) {
                        responseChannel.send(jsonObjectResponse.toString())
                        responseChannel.close()
                    }
                },
                {
                    Log.w(tag, "[doRequest:$method:$url:ERROR] ${it.message}")
                    throw it
                }
            ) {
                override fun getHeaders(): MutableMap<String, String> {
                    return getAuthorizationHeaders()
                }
            }

            with(Volley.newRequestQueue(context)) {
                add(jsonObjectRequest)
            }

            responseChannel.receive()
        }

        val rawResponse = asyncRequest.await()

        return@withContext Json.decodeFromString(rawResponse)
    }

    fun getAuthorizationHeaders(): MutableMap<String, String> {
        val headers = HashMap<String, String>()
        headers["Content-Type"] = "application/json"
        headers["X-Api-Key"] = THIRD_PARTY_DEMO_API_KEY

        currentUserJWT?.let {
            headers["Authorization"] = "Bearer $it"
        }

        return headers
    }

    companion object {
        var currentUserJWT: String? = null
    }
}
