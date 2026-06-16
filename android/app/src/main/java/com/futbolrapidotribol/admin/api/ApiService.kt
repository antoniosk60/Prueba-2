package com.futbolrapidotribol.admin.api

import com.futbolrapidotribol.admin.models.*
import retrofit2.Call
import retrofit2.http.*

interface ApiService {

    @POST("api/auth/login")
    fun login(@Body request: AuthRequest): Call<AuthResponse>

    @GET("api/reservations")
    fun getReservations(): Call<List<Reservation>>

    @PUT("api/reservations/{id}")
    fun updateReservation(
        @Path("id") id: String,
        @Body body: Map<String, String>
    ): Call<Reservation>

    @DELETE("api/reservations/{id}")
    fun deleteReservation(
        @Path("id") id: String
    ): Call<Map<String, Any>>

    @GET("api/fields")
    fun getFields(): Call<List<Field>>

    @PUT("api/fields/{id}")
    fun updateField(
        @Path("id") id: String,
        @Body body: UpdateFieldRequest
    ): Call<Field>

    @GET("api/teams")
    fun getTeams(): Call<List<Team>>

    @POST("api/teams")
    fun createTeam(
        @Body body: CreateTeamRequest
    ): Call<Team>

    @DELETE("api/teams/{id}")
    fun deleteTeam(
        @Path("id") id: String
    ): Call<Map<String, Any>>

    @GET("api/promotions")
    fun getPromotions(): Call<List<Promotion>>
}
