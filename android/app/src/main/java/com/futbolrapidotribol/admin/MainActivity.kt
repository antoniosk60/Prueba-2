package com.futbolrapidotribol.admin

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.futbolrapidotribol.admin.adapters.ReservationsAdapter
import com.futbolrapidotribol.admin.adapters.TeamsAdapter
import com.futbolrapidotribol.admin.api.RetrofitClient
import com.futbolrapidotribol.admin.models.CreateTeamRequest
import com.futbolrapidotribol.admin.models.Field
import com.futbolrapidotribol.admin.models.Promotion
import com.futbolrapidotribol.admin.models.Reservation
import com.futbolrapidotribol.admin.models.Team
import com.futbolrapidotribol.admin.models.UpdateFieldRequest
import com.google.android.material.bottomnavigation.BottomNavigationView
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    // Main layouts
    private lateinit var viewDashboard: View
    private lateinit var viewReservations: View
    private lateinit var viewTeams: View
    private lateinit var viewFields: View
    private lateinit var bottomNav: BottomNavigationView

    // Admin headers
    private lateinit var tvAdminEmail: TextView
    private lateinit var btnLogout: ImageButton

    // Dashboard widgets
    private lateinit var tvStatReservations: TextView
    private lateinit var tvStatTeams: TextView
    private lateinit var tvStatRevenue: TextView
    private lateinit var tvPromosSummary: TextView
    private lateinit var btnShortcutReservations: Button
    private lateinit var btnShortcutAddTeam: Button

    // Reservations list widgets
    private lateinit var etSearchReservations: EditText
    private lateinit var tvReservationsLoading: TextView
    private lateinit var rvReservations: RecyclerView
    private lateinit var reservationsAdapter: ReservationsAdapter

    // Teams widgets
    private lateinit var etNewTeamName: EditText
    private lateinit var etNewTeamCaptain: EditText
    private lateinit var etNewTeamDivision: EditText
    private lateinit var btnCreateTeam: Button
    private lateinit var rvTeams: RecyclerView
    private lateinit var teamsAdapter: TeamsAdapter

    // Fields widgets
    private lateinit var tvCourtTitle1: TextView
    private lateinit var etCourtRate1: EditText
    private lateinit var btnUpdateCourt1: Button
    private lateinit var tvCourtTitle2: TextView
    private lateinit var etCourtRate2: EditText
    private lateinit var btnUpdateCourt2: Button

    // Data lists
    private var allReservations = listOf<Reservation>()
    private var allFields = listOf<Field>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Session validation
        val prefs = getSharedPreferences("TribolAdmin", Context.MODE_PRIVATE)
        val authToken = prefs.getString("auth_token", null)

        if (authToken == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // Token found, configure client
        RetrofitClient.setToken(authToken)
        setContentView(R.layout.activity_main)

        // Binding layout components
        viewDashboard = findViewById(R.id.view_dashboard)
        viewReservations = findViewById(R.id.view_reservations)
        viewTeams = findViewById(R.id.view_teams)
        viewFields = findViewById(R.id.view_fields)
        bottomNav = findViewById(R.id.bottom_navigation)

        tvAdminEmail = findViewById(R.id.tv_admin_email)
        btnLogout = findViewById(R.id.btn_logout)

        tvStatReservations = findViewById(R.id.tv_stat_reservations)
        tvStatTeams = findViewById(R.id.tv_stat_teams)
        tvStatRevenue = findViewById(R.id.tv_stat_revenue)
        tvPromosSummary = findViewById(R.id.tv_promos_summary)
        btnShortcutReservations = findViewById(R.id.btn_shortcut_reservations)
        btnShortcutAddTeam = findViewById(R.id.btn_shortcut_add_team)

        etSearchReservations = findViewById(R.id.et_search_reservations)
        tvReservationsLoading = findViewById(R.id.tv_reservations_loading)
        rvReservations = findViewById(R.id.rv_reservations)

        etNewTeamName = findViewById(R.id.et_new_team_name)
        etNewTeamCaptain = findViewById(R.id.et_new_team_captain)
        etNewTeamDivision = findViewById(R.id.et_new_team_division)
        btnCreateTeam = findViewById(R.id.btn_create_team)
        rvTeams = findViewById(R.id.rv_teams)

        tvCourtTitle1 = findViewById(R.id.tv_court_title_1)
        etCourtRate1 = findViewById(R.id.et_court_rate_1)
        btnUpdateCourt1 = findViewById(R.id.btn_update_court_1)
        tvCourtTitle2 = findViewById(R.id.tv_court_title_2)
        etCourtRate2 = findViewById(R.id.et_court_rate_2)
        btnUpdateCourt2 = findViewById(R.id.btn_update_court_2)

        // Setup Header Text
        val adminMail = prefs.getString("admin_email", "admin@canchafutbol.com")
        tvAdminEmail.text = adminMail

        // Setup RecyclerView lists
        setupRecyclerViews()

        // Sync and pull baseline stats
        loadAllData()

        // Navigation configuration
        bottomNav.setOnItemSelectedListener { item ->
            hideAllTabs()
            when (item.itemId) {
                R.id.nav_dashboard -> {
                    viewDashboard.visibility = View.VISIBLE
                    loadAllData()
                    true
                }
                R.id.nav_reservations -> {
                    viewReservations.visibility = View.VISIBLE
                    loadReservationsList()
                    true
                }
                R.id.nav_teams -> {
                    viewTeams.visibility = View.VISIBLE
                    loadTeamsList()
                    true
                }
                R.id.nav_fields -> {
                    viewFields.visibility = View.VISIBLE
                    loadFieldsConfig()
                    true
                }
                else -> false
            }
        }

        // Shortcut buttons handlers
        btnShortcutReservations.setOnClickListener {
            bottomNav.selectedItemId = R.id.nav_reservations
        }
        btnShortcutAddTeam.setOnClickListener {
            bottomNav.selectedItemId = R.id.nav_teams
        }

        // Teams adding handler
        btnCreateTeam.setOnClickListener {
            val name = etNewTeamName.text.toString().trim()
            val captain = etNewTeamCaptain.text.toString().trim()
            val division = etNewTeamDivision.text.toString().trim()

            if (name.isEmpty() || captain.isEmpty() || division.isEmpty()) {
                Toast.makeText(this, "Completa todos los datos para registrar el equipo.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btnCreateTeam.isEnabled = false
            btnCreateTeam.text = "Inscribiendo..."

            val apiService = RetrofitClient.getApiService(this)
            val request = CreateTeamRequest(name, captain, division)

            apiService.createTeam(request).enqueue(object : Callback<Team> {
                override fun onResponse(call: Call<Team>, response: Response<Team>) {
                    btnCreateTeam.isEnabled = true
                    btnCreateTeam.text = "Inscribir Equipo"

                    if (response.isSuccessful) {
                        Toast.makeText(this@MainActivity, "¡Equipo registrado e inscrito!", Toast.LENGTH_LONG).show()
                        etNewTeamName.text.clear()
                        etNewTeamCaptain.text.clear()
                        etNewTeamDivision.text.clear()
                        loadTeamsList()
                    } else {
                        Toast.makeText(this@MainActivity, "Error creating team (${response.code()})", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Team>, t: Throwable) {
                    btnCreateTeam.isEnabled = true
                    btnCreateTeam.text = "Inscribir Equipo"
                    Toast.makeText(this@MainActivity, "Fallo de conexión: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            })
        }

        // Fields pricing update trigger actions
        btnUpdateCourt1.setOnClickListener { saveCourtRate("cancha-1", etCourtRate1.text.toString()) }
        btnUpdateCourt2.setOnClickListener { saveCourtRate("cancha-2", etCourtRate2.text.toString()) }

        // Logout sequence
        btnLogout.setOnClickListener {
            getSharedPreferences("TribolAdmin", Context.MODE_PRIVATE)
                .edit()
                .remove("auth_token")
                .apply()
            RetrofitClient.setToken(null)
            Toast.makeText(this, "Sesión de administración finalizada.", Toast.LENGTH_LONG).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        // Reservation search box key change triggers filter
        etSearchReservations.addTextChangedListener {
            filterReservations(it.toString())
        }
    }

    private fun setupRecyclerViews() {
        // Setup reservations RV
        rvReservations.layoutManager = LinearLayoutManager(this)
        reservationsAdapter = ReservationsAdapter(
            this,
            listOf(),
            onStatusChanged = { reservationId, newStatus, newPaymentStatus ->
                updateReservationStatus(reservationId, newStatus, newPaymentStatus)
            },
            onDeleteClicked = { id ->
                deleteReservationRecord(id)
            }
        )
        rvReservations.adapter = reservationsAdapter

        // Setup teams RV
        rvTeams.layoutManager = LinearLayoutManager(this)
        teamsAdapter = TeamsAdapter(this, listOf()) { id ->
            deleteTeamRecord(id)
        }
        rvTeams.adapter = teamsAdapter
    }

    private fun hideAllTabs() {
        viewDashboard.visibility = View.GONE
        viewReservations.visibility = View.GONE
        viewTeams.visibility = View.GONE
        viewFields.visibility = View.GONE
    }

    // Refresh metrics on Dashboard
    private fun loadAllData() {
        loadReservationsList()
        loadTeamsList()
        loadPromotions()
    }

    private fun loadReservationsList() {
        tvReservationsLoading.visibility = View.VISIBLE
        val apiService = RetrofitClient.getApiService(this)
        apiService.getReservations().enqueue(object : Callback<List<Reservation>> {
            override fun onResponse(call: Call<List<Reservation>>, response: Response<List<Reservation>>) {
                tvReservationsLoading.visibility = View.GONE
                if (response.isSuccessful && response.body() != null) {
                    allReservations = response.body()!!
                    reservationsAdapter.updateList(allReservations)
                    calculateDashboardMetrics()
                }
            }

            override fun onFailure(call: Call<List<Reservation>>, t: Throwable) {
                tvReservationsLoading.visibility = View.GONE
                Toast.makeText(this@MainActivity, "No se obtuvieron las reservas: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun loadTeamsList() {
        val apiService = RetrofitClient.getApiService(this)
        apiService.getTeams().enqueue(object : Callback<List<Team>> {
            override fun onResponse(call: Call<List<Team>>, response: Response<List<Team>>) {
                if (response.isSuccessful && response.body() != null) {
                    val teams = response.body()!!
                    teamsAdapter.updateList(teams)
                    tvStatTeams.text = teams.size.toString()
                }
            }

            override fun onFailure(call: Call<List<Team>>, t: Throwable) {
                // Squelch background errors beautifully
            }
        })
    }

    private fun loadFieldsConfig() {
        val apiService = RetrofitClient.getApiService(this)
        apiService.getFields().enqueue(object : Callback<List<Field>> {
            override fun onResponse(call: Call<List<Field>>, response: Response<List<Field>>) {
                if (response.isSuccessful && response.body() != null) {
                    allFields = response.body()!!
                    
                    // Match rates
                    val cancha1 = allFields.find { it.id == "cancha-1" }
                    val cancha2 = allFields.find { it.id == "cancha-2" }

                    cancha1?.let {
                        tvCourtTitle1.text = "${it.name}"
                        etCourtRate1.setText(it.basePricePerHour.toInt().toString())
                    }
                    cancha2?.let {
                        tvCourtTitle2.text = "${it.name}"
                        etCourtRate2.setText(it.basePricePerHour.toInt().toString())
                    }
                }
            }

            override fun onFailure(call: Call<List<Field>>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo al conectar con canchas.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun loadPromotions() {
        val apiService = RetrofitClient.getApiService(this)
        apiService.getPromotions().enqueue(object : Callback<List<Promotion>> {
            override fun onResponse(call: Call<List<Promotion>>, response: Response<List<Promotion>>) {
                if (response.isSuccessful && response.body() != null) {
                    val promos = response.body()!!
                    if (promos.isNotEmpty()) {
                        val activeCount = promos.count { it.isActive }
                        tvPromosSummary.text = "Código de temporada: ${promos[0].promoCode} (${promos[0].discount} descuento)\nTotal de promociones vigentes: $activeCount"
                    } else {
                        tvPromosSummary.text = "Sin códigos de descuento registrados para este ciclo."
                    }
                }
            }

            override fun onFailure(call: Call<List<Promotion>>, t: Throwable) {
                tvPromosSummary.text = "Error al sincronizar promociones de la nube."
            }
        })
    }

    private fun calculateDashboardMetrics() {
        // Exclude cancelled matches
        val activeReservations = allReservations.filter { it.status.lowercase() != "cancelled" }
        tvStatReservations.text = activeReservations.size.toString()

        // Calculate revenue
        val mxnRevenue = activeReservations
            .filter { it.paymentStatus.lowercase() == "paid" }
            .sumOf { it.totalPrice }
            .toInt()

        tvStatRevenue.text = "$$mxnRevenue MXN"
    }

    private fun filterReservations(query: String) {
        if (query.isEmpty()) {
            reservationsAdapter.updateList(allReservations)
            return
        }
        val lower = query.lowercase()
        val filtered = allReservations.filter {
            it.userName.lowercase().contains(lower) ||
            it.fieldName.lowercase().contains(lower) ||
            it.date.contains(lower) ||
            it.status.lowercase().contains(lower)
        }
        reservationsAdapter.updateList(filtered)
    }

    private fun updateReservationStatus(reservationId: String, status: String, paymentStatus: String) {
        val apiService = RetrofitClient.getApiService(this)
        val requestBody = mapOf(
            "status" to status,
            "paymentStatus" to paymentStatus
        )

        apiService.updateReservation(reservationId, requestBody).enqueue(object : Callback<Reservation> {
            override fun onResponse(call: Call<Reservation>, response: Response<Reservation>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Estado de reservación sincronizado correctemente.", Toast.LENGTH_SHORT).show()
                    loadReservationsList()
                } else {
                    Toast.makeText(this@MainActivity, "Error de actualización (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Reservation>, t: Throwable) {
                Toast.makeText(this@MainActivity, "No se conectó al servidor para actualizar.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun deleteReservationRecord(reservationId: String) {
        val apiService = RetrofitClient.getApiService(this)
        apiService.deleteReservation(reservationId).enqueue(object : Callback<Map<String, Any>> {
            override fun onResponse(call: Call<Map<String, Any>>, response: Response<Map<String, Any>>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Reservación eliminada definitivamente del servidor.", Toast.LENGTH_LONG).show()
                    loadReservationsList()
                } else {
                    Toast.makeText(this@MainActivity, "Fallo al borrar (${response.code()})", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Map<String, Any>>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo de conexión.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun deleteTeamRecord(teamId: String) {
        val apiService = RetrofitClient.getApiService(this)
        apiService.deleteTeam(teamId).enqueue(object : Callback<Map<String, Any>> {
            override fun onResponse(call: Call<Map<String, Any>>, response: Response<Map<String, Any>>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "Equipo removido del torneo.", Toast.LENGTH_SHORT).show()
                    loadTeamsList()
                } else {
                    Toast.makeText(this@MainActivity, "Error de remoción.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Map<String, Any>>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo de red.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun saveCourtRate(courtId: String, rateString: String) {
        val rate = rateString.toDoubleOrNull()
        if (rate == null || rate < 0) {
            Toast.makeText(this, "Precio inválido.", Toast.LENGTH_SHORT).show()
            return
        }

        val apiService = RetrofitClient.getApiService(this)
        val body = UpdateFieldRequest(rate)

        apiService.updateField(courtId, body).enqueue(object : Callback<Field> {
            override fun onResponse(call: Call<Field>, response: Response<Field>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@MainActivity, "¡Tarifa de cancha actualizada en la nube!", Toast.LENGTH_SHORT).show()
                    loadFieldsConfig()
                } else {
                    Toast.makeText(this@MainActivity, "Fallo al guardar.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Field>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Fallo de red al registrar tarifa.", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
