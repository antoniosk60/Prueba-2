package com.futbolrapidotribol.admin.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.RecyclerView
import com.futbolrapidotribol.admin.R
import com.futbolrapidotribol.admin.models.Team

class TeamsAdapter(
    private val context: Context,
    private var teams: List<Team>,
    private val onDeleteClicked: (teamId: String) -> Unit
) : RecyclerView.Adapter<TeamsAdapter.TeamViewHolder>() {

    fun updateList(newList: List<Team>) {
        teams = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TeamViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.item_team, parent, false)
        return TeamViewHolder(view)
    }

    override fun onBindViewHolder(holder: TeamViewHolder, position: Int) {
        val team = teams[position]
        holder.bind(team)
    }

    override fun getItemCount(): Int = teams.size

    inner class TeamViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvTeamName: TextView = itemView.findViewById(R.id.tv_team_name)
        private val tvTeamStats: TextView = itemView.findViewById(R.id.tv_team_stats)
        private val tvTeamDivision: TextView = itemView.findViewById(R.id.tv_team_division)
        private val tvTeamCaptain: TextView = itemView.findViewById(R.id.tv_team_captain)
        private val btnDelete: ImageButton = itemView.findViewById(R.id.btn_delete_team)

        fun bind(team: Team) {
            tvTeamName.text = team.name
            tvTeamStats.text = "PTS: ${team.points} | PJ: ${team.played} (V:${team.won} E:${team.drawn} D:${team.lost})"
            tvTeamDivision.text = team.division ?: "División Libre"
            tvTeamCaptain.text = "Capitán: ${team.captainName ?: "No asignado"}"

            btnDelete.setOnClickListener {
                AlertDialog.Builder(context, android.R.style.Theme_DeviceDefault_Dialog_Alert)
                    .setTitle("Eliminar Equipo")
                    .setMessage("¿Estás seguro de que deseas eliminar al equipo '${team.name}' del torneo?")
                    .setPositiveButton("Eliminar") { _, _ -> onDeleteClicked(team.id) }
                    .setNegativeButton("Cancelar", null)
                    .show()
            }
        }
    }
}
