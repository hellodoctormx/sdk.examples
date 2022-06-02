package com.hellodoctormx.examples.foodpass

import android.content.Context
import kotlinx.serialization.Serializable

class FoodPassServiceAPI(context: Context) : FoodPassServiceHTTTPClient(context) {
    suspend fun getHelloDoctorUser(): GetHelloDoctorUserResponse {
        return this.get(path = "/users/me/hellodoctor")
    }

    suspend fun createHelloDoctorUser(): CreateHelloDoctorUserResponse {
        return this.post(
            path = "/users/me/hellodoctor",
            postData = null
        )
    }

    @Serializable
    data class GetHelloDoctorUserResponse(val uid: String, val authToken: String)

    @Serializable
    data class CreateHelloDoctorUserResponse(val uid: String, val authToken: String)
}
