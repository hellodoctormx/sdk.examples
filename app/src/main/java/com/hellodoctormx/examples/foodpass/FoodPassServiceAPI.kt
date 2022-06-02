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
    data class GetHelloDoctorUserResponse(
        override val uid: String,
        override val refreshToken: String
    ) : HelloDoctorUserResponse

    @Serializable
    data class CreateHelloDoctorUserResponse(
        override val uid: String,
        override val refreshToken: String
    ) : HelloDoctorUserResponse
}

interface HelloDoctorUserResponse {
    val uid: String
    val refreshToken: String
}