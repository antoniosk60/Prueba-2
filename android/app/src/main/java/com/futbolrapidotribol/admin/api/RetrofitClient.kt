package com.futbolrapidotribol.admin.api

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson:GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private var token: String? = null
    private var baseUrl: String = "https://ais-dev-trmfkkvl4di76jnrnkwfg6-270141958746.us-west2.run.app/"
    private var apiService: ApiService? = null

    fun setToken(newToken: String?) {
        token = newToken
        apiService = null // Reset service to recreate client with new token
    }

    fun setBaseUrl(newUrl: String) {
        val sanitized = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        if (baseUrl != sanitized) {
            baseUrl = sanitized
            apiService = null // Reset service to recreate client with new base URL
        }
    }

    fun getBaseUrl(): String = baseUrl

    fun getApiService(context: Context): ApiService {
        if (apiService == null) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val clientBuilder = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .addInterceptor(logging)

            // Add authorization token if available
            clientBuilder.addInterceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                token?.let {
                    requestBuilder.addHeader("Authorization", "Bearer $it")
                }
                chain.proceed(requestBuilder.build())
            }

            val retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .client(clientBuilder.build())
                .build()

            apiService = retrofit.create(ApiService::class.java)
        }
        return apiService!!
    }
}
