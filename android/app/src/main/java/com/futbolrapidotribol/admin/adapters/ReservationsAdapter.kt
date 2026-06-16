package com.futbolrapidotribol.admin.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.RecyclerView
import com.futbolrapidotribol.admin.R
import com.futbolrapidotribol.admin.models.Reservation

class ReservationsAdapter(
    private val context: Context,
    private var reservations: List<Reservation>,
    private val onStatusChanged: (reservationId: String, newStatus: String, newPaymentStatus: String) -> Unit,
    private val onDeleteClicked: (reservationId: String) -> Unit
) : RecyclerView.Adapter<ReservationsAdapter.ReservationViewHolder>() {

    fun updateList(newList: List<Reservation>) {
        reservations = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReservationViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.item_reservation, parent, false)
        return ReservationViewHolder(view)
    }

    override fun onBindViewHolder(holder: ReservationViewHolder, position: Int) {
        val reservation = reservations[position]
        holder.bind(reservation)
    }

    override fun getItemCount(): Int = reservations.size

    inner class ReservationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvClientName: TextView = itemView.findViewById(R.id.tv_client_name)
        private val tvDateTimeSlot: TextView = itemView.findViewById(R.id.tv_date_timeslot)
        private val tvCourtName: TextView = itemView.findViewById(R.id.tv_court_name)
        private val tvPrice: TextView = itemView.findViewById(R.id.tv_price)
        private val tvStatusBadge: TextView = itemView.findViewById(R.id.tv_status_badge)
        private val tvPaymentBadge: TextView = itemView.findViewById(R.id.tv_payment_badge)
        private val btnManage: Button = itemView.findViewById(R.id.btn_manage_reservation)

        fun bind(res: Reservation) {
            tvClientName.text = res.userName
            tvDateTimeSlot.text = "${res.date} • ${res.timeSlot}"
            tvCourtName.text = res.fieldName
            tvPrice.text = "$${res.totalPrice.toInt()} MXN"

            // Set Reservation Status color badges
            when (res.status.lowercase()) {
                "confirmed" -> {
                    tvStatusBadge.text = "Confirmada"
                    tvStatusBadge.setBackgroundColor(context.getColor(R.color.success_green))
                }
                "cancelled" -> {
                    tvStatusBadge.text = "Cancelada"
                    tvStatusBadge.setBackgroundColor(context.getColor(R.color.error_red))
                }
                else -> {
                    tvStatusBadge.text = "Pendiente"
                    tvStatusBadge.setBackgroundColor(context.getColor(R.color.warning_orange))
                }
            }

            // Set Payment Status color badges
            when (res.paymentStatus.lowercase()) {
                "paid" -> {
                    tvPaymentBadge.text = "Pagada"
                    tvPaymentBadge.setBackgroundColor(context.getColor(R.color.success_green))
                }
                "partial" -> {
                    tvPaymentBadge.text = "Anticipo"
                    tvPaymentBadge.setBackgroundColor(context.getColor(R.color.link_blue))
                }
                else -> {
                    tvPaymentBadge.text = "No Pagado"
                    tvPaymentBadge.setBackgroundColor(context.getColor(R.color.error_red))
                }
            }

            btnManage.setOnClickListener {
                showManageDialog(res)
            }
        }

        private fun showManageDialog(res: Reservation) {
            val options = arrayOf(
                "Confirmar Reservación",
                "Marcar como Pagada",
                "Marcar como Pendiente (Pago)",
                "Cancelar Reservación",
                "Eliminar Reservación (Permanente)"
            )

            AlertDialog.Builder(context, android.R.style.Theme_DeviceDefault_Dialog_Alert)
                .setTitle("Gestionar Reservación")
                .setItems(options) { dialog, which ->
                    when (which) {
                        0 -> onStatusChanged(res.id, "confirmed", res.paymentStatus)
                        1 -> onStatusChanged(res.id, res.status, "paid")
                        2 -> onStatusChanged(res.id, res.status, "pending")
                        3 -> onStatusChanged(res.id, "cancelled", res.paymentStatus)
                        4 -> {
                            AlertDialog.Builder(context, android.R.style.Theme_DeviceDefault_Dialog_Alert)
                                .setTitle("Confirmar Eliminación")
                                .setMessage("¿Estás seguro de que deseas eliminar esta reservación de forma definitiva?")
                                .setPositiveButton("Sí, Eliminar") { _, _ -> onDeleteClicked(res.id) }
                                .setNegativeButton("No", null)
                                .show()
                        }
                    }
                    dialog.dismiss()
                }
                .setNegativeButton("Cerrar", null)
                .show()
        }
    }
}
