package com.futbolrapidotribol.admin.models

data class AuthRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val user: User
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val phone: String?,
    val role: String
)

data class Reservation(
    val id: String,
    val userId: String,
    val userName: String,
    val userEmail: String,
    val userPhone: String,
    val date: String,
    val timeSlot: String,
    val duration: Double,
    val fieldId: String,
    val fieldName: String,
    val hasLights: Boolean,
    val totalPrice: Double,
    var status: String, // pending, confirmed, cancelled
    var paymentStatus: String, // pending, paid, partial
    val entryCode: String?,
    val createdAt: String?
)

data class UpdateReservationStatusRequest(
    val status: String,
    val paymentStatus: String
)

data class Field(
    val id: String,
    val name: String,
    val type: String?,
    val basePricePerHour: Double
)

data class UpdateFieldRequest(
    val basePricePerHour: Double
)

data class Team(
    val id: String,
    val name: String,
    val logo: String?,
    val captainName: String?,
    val division: String?,
    val points: Int,
    val played: Int,
    val won: Int,
    val drawn: Int,
    val lost: Int
)

data class CreateTeamRequest(
    val name: String,
    val captainName: String,
    val division: String
)

data class Promotion(
    val id: String,
    val title: String,
    val description: String,
    val discount: String,
    val promoCode: String,
    val isActive: Boolean
)
