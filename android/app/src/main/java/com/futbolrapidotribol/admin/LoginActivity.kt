package com.futbolrapidotribol.admin

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.futbolrapidotribol.admin.api.RetrofitClient
import com.futbolrapidotribol.admin.models.AuthRequest
import com.futbolrapidotribol.admin.models.AuthResponse
import com.futbolrapidotribol.admin.models.Field
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    private lateinit var pulseDot: View
    private lateinit var statusText: TextView
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etServerUrl: EditText
    private lateinit var btnLogin: Button
    private lateinit var btnDemoAutofill: Button
    private lateinit var btnSaveUrl: Button

    private var pulseAnimator: ObjectAnimator? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Initialize UI components
        pulseDot = findViewById(R.id.pulse_dot)
        statusText = findViewById(R.id.status_text)
        etEmail = findViewById(R.id.et_email)
        etPassword = findViewById(R.id.et_password)
        etServerUrl = findViewById(R.id.et_server_url)
        btnLogin = findViewById(R.id.btn_login)
        btnDemoAutofill = findViewById(R.id.btn_demo_autofill)
        btnSaveUrl = findViewById(R.id.btn_save_url)

        // Set server URL
        val savedServerUrl = getSharedPreferences("TribolAdmin", Context.MODE_PRIVATE)
            .getString("server_url", RetrofitClient.getBaseUrl()) ?: RetrofitClient.getBaseUrl()
        etServerUrl.setText(savedServerUrl)
        RetrofitClient.setBaseUrl(savedServerUrl)

        // Start pulse animation on the connectivity dot
        startPulseAnimation()

        // Test server connection on startup
        testConnection()

        // Handle URL modification
        btnSaveUrl.setOnClickListener {
            val inputUrl = etServerUrl.text.toString().trim()
            if (inputUrl.isNotEmpty()) {
                RetrofitClient.setBaseUrl(inputUrl)
                getSharedPreferences("TribolAdmin", Context.MODE_PRIVATE)
                    .edit()
                    .putString("server_url", inputUrl)
                    .apply()
                Toast.makeText(this, "Base URL guardada. Probando conexión...", Toast.LENGTH_SHORT).show()
                testConnection()
            }
        }

        // Handle Demo Fill In
        btnDemoAutofill.setOnClickListener {
            etEmail.setText("admin@canchafutbol.com")
            etPassword.setText("admin")
            Toast.makeText(this, "Credenciales de administrador cargadas.", Toast.LENGTH_SHORT).show()
        }

        // Main Login sequence
        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Por favor, ingresa el correo y la contraseña.", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            btnLogin.isEnabled = false
            btnLogin.text = "Iniciando sesión..."

            val apiService = RetrofitClient.getApiService(this)
            val loginRequest = AuthRequest(email, password)

            apiService.login(loginRequest).enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    btnLogin.isEnabled = true
                    btnLogin.text = "Ingresar al Sistema"

                    if (response.isSuccessful && response.body() != null) {
                        val authData = response.body()!!
                        
                        // Check role
                        if (authData.user.role != "admin") {
                            Toast.makeText(this@LoginActivity, "Acceso denegado: Se requieren privilegios de Administrador.", Toast.LENGTH_LONG).show()
                            return
                        }

                        // Store in Retrofit Client
                        RetrofitClient.setToken(authData.token)

                        // Persist session
                        getSharedPreferences("TribolAdmin", Context.MODE_PRIVATE)
                            .edit()
                            .putString("auth_token", authData.token)
                            .putString("admin_id", authData.user.id)
                            .putString("admin_name", authData.user.name)
                            .putString("admin_email", authData.user.email)
                            .apply()

                        Toast.makeText(this@LoginActivity, "¡Bienvenido, ${authData.user.name}!", Toast.LENGTH_SHORT).show()

                        // Start MainActivity
                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "Error: Credenciales inválidas. Verifica tus datos.", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    btnLogin.isEnabled = true
                    btnLogin.text = "Ingresar al Sistema"
                    Toast.makeText(this@LoginActivity, "Fallo al conectar con el servidor: ${t.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            })
        }
    }

    private fun testConnection() {
        statusText.text = "Probando conexión..."
        pulseDot.setBackgroundResource(R.color.warning_orange)

        val apiService = RetrofitClient.getApiService(this)
        apiService.getFields().enqueue(object : Callback<List<Field>> {
            override fun onResponse(call: Call<List<Field>>, response: Response<List<Field>>) {
                if (response.isSuccessful) {
                    statusText.text = "Servidor Conectado"
                    pulseDot.setBackgroundResource(R.color.success_green)
                } else {
                    statusText.text = "Error de Servidor (${response.code()})"
                    pulseDot.setBackgroundResource(R.color.error_red)
                }
            }

            override fun onFailure(call: Call<List<Field>>, t: Throwable) {
                statusText.text = "Servidor Desconectado"
                pulseDot.setBackgroundResource(R.color.error_red)
            }
        })
    }

    private fun startPulseAnimation() {
        pulseAnimator = ObjectAnimator.ofFloat(pulseDot, "alpha", 1.0f, 0.3f).apply {
            duration = 800
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            start()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        pulseAnimator?.cancel()
    }
}
